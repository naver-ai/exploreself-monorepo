import { useEffect, useMemo, useRef, useState } from "react";
import { useUId } from "../../users/hooks";
import { useDispatch, useSelector } from "../../../../redux/hooks";
import { browserSessionSelectors, fetchBrowserSessionsOfUser } from "../reducer";
import { Navigate } from "react-router-dom";
import { usersSelectors } from "../../users/reducer";
import { Collapse } from "antd";
import { Http } from "../../../../net/http";
import { LoadingIndicator } from "../../../../components/LoadingIndicator";
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { eventWithTimeAndPacker } from "rrweb/typings/packer/base";
import { useResizeDetector } from "react-resize-detector"
import moment from "moment-timezone";

const BrowserSessionDetailView = (props: {sessionId: string}) => {

  const eventsRef = useRef<Array<any> | null>(null)
  const [lastEventTimestamp, setLastEventTimestamp] = useState<number|undefined>(undefined)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventExists, setEventExists] = useState(false)
  const token = useSelector(state => state.admin.auth.token)

  const userId = useUId()!

  const playerViewId = `rrweb-replayer-${props.sessionId}`

  const replayerRef = useRef<rrwebPlayer|null>(null)

  const {width: replayerWidth, height: replayerHeight, ref} = useResizeDetector({handleHeight: true, refreshMode: 'debounce', refreshRate: 500})

  useEffect(()=>{
    if(token != null){
      setIsLoadingEvents(true)
      Http.axios.get(`admin/users/${userId}/browser_sessions/${props.sessionId}`, {headers: Http.makeSignedInHeader(token)}).then(resp => {
          const jsonLines: Array<string> = resp.data.eventsJsonLines.split("\n").filter((l: string)=> l != "")
          const events: Array<eventWithTimeAndPacker> = jsonLines.map(l =>JSON.parse(l))
          eventsRef.current = events

          setEventExists(events.length > 0)
          setLastEventTimestamp(events.length > 0 ? events[events.length-1].timestamp : undefined)
      }).catch((err) => {
        console.log(err)
        setEventExists(false)
        setLastEventTimestamp(undefined)
      }).finally(()=>{
        setIsLoadingEvents(false)
      })
      
    }
  }, [props.sessionId, userId, token])

  useEffect(()=>{

    replayerRef.current?.pause()
    const dom = document.getElementById(playerViewId)
    if(dom != null){
      dom.innerHTML = ""
    }
    replayerRef.current = null

    if(lastEventTimestamp && replayerWidth != null && replayerHeight != null){
      console.log("Initialized rrweb player.")
      replayerRef.current = new rrwebPlayer({
        target: document.getElementById(playerViewId)!,
        props: {
          events: eventsRef.current!,
          width: replayerWidth,
          height: replayerHeight-80
        }
      })
      replayerRef.current?.play()
    }
  }, [lastEventTimestamp, replayerWidth, replayerHeight])
  


  return <div>
    {
      isLoadingEvents === true ? <LoadingIndicator title="Loading session recording..."/> : (eventExists === false ? <div>No session recording</div> : <div ref={ref} className="h-[500px] xl:h-[800px]" id={playerViewId}/>)
    }
  </div>
}

const UserDetailPage = () => {

  const dispatch = useDispatch()

  const userId = useUId()

  const user = useSelector(state => usersSelectors.selectById(state, userId || ""))

  const sessions = useSelector(browserSessionSelectors.selectAll)

  const collapseItems = useMemo(()=> {
    return sessions.map(session => {
      const startedTimeString = moment.tz(session.startedTimestamp, session.localTimezone).format("YYYY-MM-DD, hh:mm:ss A (zz)")
      
      const endedTimeString = session.endedTimestamp != null ? moment.tz(session.endedTimestamp, session.localTimezone).format("YYYY-MM-DD, hh:mm:ss A (zz)") : undefined
      
      return {
        key: session._id,
        label: <div className="flex items-center gap-x-2"><span className={`text-xs font-semibold px-2 py-1 rounded-md text-white ${endedTimeString != null ? "bg-gray-500" : "bg-blue-500"}`}>{endedTimeString != null ? "Terminated" : "Ongoing"}</span>
          <span className="text-sm">{endedTimeString != null ? `${startedTimeString} - ${endedTimeString}` : <span>{startedTimeString}</span> }</span></div>,
        children: <BrowserSessionDetailView sessionId={session._id}/>
      }
    })
  }, [sessions])

  useEffect(()=>{
      dispatch(fetchBrowserSessionsOfUser(userId!))
  }, [userId])

  return userId == null ? <Navigate to="admin/users"/> : (
    <div className='lg:max-w-[1024px] xl:max-w-[1280px] mx-auto px-10 py-10 flex flex-col'>
      <h1 className="text-lg font-bold">User Detail - {user?.alias}</h1>
      <Collapse className="mt-10" accordion items={collapseItems} destroyInactivePanel={true}/>
    </div>
  )
}

export default UserDetailPage;