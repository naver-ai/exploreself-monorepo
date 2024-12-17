import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { useEffect } from 'react';
import { Spin } from 'antd';
import * as rrweb from 'rrweb'
import { Http } from '../../../net/http';
import { SessionRecordingManager } from '../../../services/recording';
import { socket } from '../../../services/socket';
import { SocketEvents } from '@core';
import { mountUser } from '../reducer';

export const SignedInScreenFrame = (props: { withHeader: boolean }) => {
  const dispatch = useDispatch();

  const token = useSelector(state => state.auth.token)

  const isLoadingUserInfo = useSelector(
    (state) => state.user.isLoadingUserInfo
  );

  useEffect(()=>{
    if(token != null){
      dispatch(mountUser()).then(userId => {
        
      })
    }
  }, [token])

  useEffect(()=>{
    let stopRecording: (()=>void) | undefined = undefined
    let sessionId: string
    if(token != null){

      Http.axios.post("/user/browser_sessions/start", null, {headers: Http.makeSignedInHeader(token)}).then(resp => {
        sessionId = resp.data.sessionId
        stopRecording = rrweb.record({
          emit(e, isCheckout) {
            SessionRecordingManager.instance.pushEvent(e)
            if(socket.connected){
              socket.emit(SocketEvents.OnScreenRecordingEvent, e)
            }
          },
        })

        SessionRecordingManager.instance.startLogUploading(token, sessionId)

        socket.auth = {
          token,
          mode: 'user',
          browserSessionId: sessionId
        }

        socket.on('connect', ()=>{
          console.log("Connected to socket.")
        })

        socket.connect()
      })
      
      return () => {
        stopRecording?.()
        SessionRecordingManager.instance.stopLogUploading()

        socket.disconnect()
      }
    }
      
  }, [token])

  return props.withHeader === true ? (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-hidden relative">
        {isLoadingUserInfo == true ? (
          <div className="p-10">
            <Spin tip="Loading...">
              <div />
            </Spin>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  ) : isLoadingUserInfo == true ? (
    <div className="p-10">
      <Spin tip="Loading...">
        <div />
      </Spin>
    </div>
  ) : (
    <Outlet />
  );
};
