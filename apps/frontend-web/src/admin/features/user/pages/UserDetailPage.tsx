import { useEffect, useMemo, useRef, useState } from "react";
import { useUId } from "../../users/hooks";
import { useDispatch, useSelector } from "../../../../redux/hooks";
import { browserSessionSelectors, fetchBrowserSessionsOfUser } from "../reducer";
import { Navigate } from "react-router-dom";
import { usersSelectors } from "../../users/reducer";
import { Collapse } from "antd";
import { Http } from "../../../../net/http";
import { LoadingIndicator } from "../../../../components/LoadingIndicator";
import * as rrweb from 'rrweb'
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { eventWithTimeAndPacker } from "rrweb/typings/packer/base";
import { useResizeDetector } from "react-resize-detector"
import moment from "moment-timezone";
import { socket } from "../../../../services/socket";
import { SocketEvents } from "@core";

async function loadBrowserSessionEvents(sessionId: string, userId: string, token: string): Promise<Array<eventWithTimeAndPacker>> {
  const resp = await Http.axios.get(`admin/users/${userId}/browser_sessions/${sessionId}`, { headers: Http.makeSignedInHeader(token) })
  const jsonLines: Array<string> = resp.data.eventsJsonLines.split("\n").filter((l: string) => l != "")
  const events: Array<eventWithTimeAndPacker> = jsonLines.map(l => JSON.parse(l))
  return events
}

const BrowserSessionDetailView = (props: { sessionId: string, isLiveMode: boolean }) => {

  const eventsRef = useRef<Array<any> | null>(null)
  const [lastEventTimestamp, setLastEventTimestamp] = useState<number | undefined>(undefined)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventExists, setEventExists] = useState(false)
  const token = useSelector(state => state.admin.auth.token)

  const userId = useUId()!

  const playerViewId = `rrweb-replayer-${props.sessionId}`

  const replayerRef = useRef<rrwebPlayer | rrweb.Replayer | null>(null)

  const { width: replayerWidth, height: replayerHeight, ref } = useResizeDetector({ handleHeight: true, refreshMode: 'debounce', refreshRate: 500 })

  useEffect(() => {
    if (token != null) {
      setIsLoadingEvents(true)
      loadBrowserSessionEvents(props.sessionId, userId, token).then(events => {
        eventsRef.current = events
        setEventExists(events.length > 0)
        setLastEventTimestamp(events.length > 0 ? events[events.length - 1].timestamp : undefined)
      }).catch((err) => {
        console.log(err)
        setEventExists(false)
        setLastEventTimestamp(undefined)
      }).finally(() => {
        setIsLoadingEvents(false)
      })

    }
  }, [props.sessionId, userId, token])

  useEffect(() => {

    let resizeObserver: ResizeObserver | undefined = undefined

    if (replayerWidth != null && replayerHeight != null) {
      if (props.isLiveMode == true) {
        /*
        console.log("Initialized rrweb player in live mode.")
        replayerRef.current = new rrweb.Replayer(eventsRef.current!, {
          root: document.getElementById(playerViewId)!,
          liveMode: true
        })
        replayerRef.current?.startLive(Date.now() - 1000)
        replayerRef.current?.play()*/
        loadBrowserSessionEvents(props.sessionId, userId, token!).then(events => {
          
          /*replayerRef.current = new rrwebPlayer({
            target: document.getElementById(playerViewId)!,
            props: {
              liveMode: true,
              events: events,
              width: replayerWidth,
              height: replayerHeight - 80,
              speedOption: [1],
              autoPlay: true
            }
          })
          replayerRef.current?.getReplayer()?.play(Date.now() - events[0].timestamp - 1000)*/
          
          console.log("Initialized rrweb player in live mode.")
          replayerRef.current = new rrweb.Replayer(events, {
            root: document.getElementById(playerViewId)!,
            liveMode: true,
            useVirtualDom: true,
            showWarning: false,
          })
          const elm = document.getElementById(playerViewId)?.getElementsByClassName("replayer-wrapper")?.item(0)
          console.log(elm)
          if(elm != null){
            elm.className = "replayer-wrapper !left-0 !top-0 !block !float-none w-full h-full"
            const iframeElm = elm.getElementsByTagName("iframe").item(0)
            if(iframeElm != null){
              resizeObserver = new ResizeObserver(entries => {
                if(entries.length > 0){
                  const width = entries[0].contentRect.width
                  const height = entries[0].contentRect.height
                  const ratio = Math.min(replayerWidth/width, replayerHeight/height)
                  const style = (elm as any).style
                  style.transform = `scale(${ratio})`
                }
              })
              resizeObserver?.observe(iframeElm)
            }
            console.log(iframeElm, iframeElm?.getBoundingClientRect(), iframeElm?.offsetHeight, iframeElm?.offsetWidth)
          }
          


          replayerRef.current?.play(Date.now() - events[0].timestamp - 1000)
        })
      } else if (lastEventTimestamp != null) {
        console.log("Initialized rrweb player in replay mode -", eventsRef.current!.length)
        replayerRef.current = new rrwebPlayer({
          target: document.getElementById(playerViewId)!,
          props: {
            showWarning: false,
            events: eventsRef.current!,
            width: replayerWidth,
            height: replayerHeight - 80
          }
        })
        replayerRef.current?.getReplayer()?.play()
      }
    }

    return () => {
      
      if(props.isLiveMode){
        if(replayerRef.current != null){
          const player = replayerRef.current as rrweb.Replayer
          player.destroy()
        }
      }else{
        if(replayerRef.current != null){
          const player = replayerRef.current as rrwebPlayer
          player.getReplayer().destroy()
        }
      }

      const dom = document.getElementById(playerViewId)
      if (dom != null) {
        dom.innerHTML = ""
      }
      replayerRef.current = null

      resizeObserver?.disconnect()
      resizeObserver = undefined
    }
  }, [lastEventTimestamp, replayerWidth, replayerHeight, props.isLiveMode])

  useEffect(() => {
    if (props.isLiveMode === true) {
      const rrwebEventReceiveHander = (args: { browserSessionId: string, event: eventWithTimeAndPacker }) => {
        if (args.browserSessionId == props.sessionId) {
          if (replayerRef.current) {
            const player = replayerRef.current as rrweb.Replayer
            player.addEvent(args.event)
          }
        }
      }
      console.log("Socket connected:", socket.connected)
      socket.on(SocketEvents.OnScreenRecordingEvent, rrwebEventReceiveHander)

      return () => {
        socket.off(SocketEvents.OnScreenRecordingEvent, rrwebEventReceiveHander)
      }
    }

  }, [props.sessionId, props.isLiveMode, token])


  return <div>
    {
      isLoadingEvents === true ? <LoadingIndicator title="Loading session recording..." /> : ((props.isLiveMode === false && eventExists === false) ? <div>No session recording</div> : <div ref={ref} className="h-[500px] xl:h-[800px]" id={playerViewId} />)
    }
  </div>
}

const UserDetailPage = () => {

  const dispatch = useDispatch()

  const userId = useUId()

  const user = useSelector(state => usersSelectors.selectById(state, userId || ""))

  const sessions = useSelector(browserSessionSelectors.selectAll)

  const collapseItems = useMemo(() => {
    return sessions.map(session => {
      const startedTimeString = moment.tz(session.startedTimestamp, session.localTimezone).format("YYYY-MM-DD, hh:mm:ss A (zz)")

      const endedTimeString = session.endedTimestamp != null ? moment.tz(session.endedTimestamp, session.localTimezone).format("YYYY-MM-DD, hh:mm:ss A (zz)") : undefined

      return {
        key: session._id,
        label: <div className="flex items-center gap-x-2"><span className={`text-xs font-semibold px-2 py-1 rounded-md text-white ${endedTimeString != null ? "bg-gray-500" : "bg-blue-500"}`}>{endedTimeString != null ? "Terminated" : "Ongoing"}</span>
          <span className="text-sm">{endedTimeString != null ? `${startedTimeString} - ${endedTimeString}` : <span>{startedTimeString}</span>}</span></div>,
        children: <BrowserSessionDetailView sessionId={session._id} isLiveMode={session.endedTimestamp == null} />
      }
    })
  }, [sessions])

  useEffect(() => {
    dispatch(fetchBrowserSessionsOfUser(userId!))
  }, [userId])

  return userId == null ? <Navigate to="admin/users" /> : (
    <div className='lg:max-w-[1024px] xl:max-w-[1280px] mx-auto px-10 py-10 flex flex-col'>
      <h1 className="text-lg font-bold">User Detail - {user?.alias}</h1>
      <Collapse className="mt-10" accordion items={collapseItems} destroyInactivePanel={true} />
    </div>
  )
}

export default UserDetailPage;