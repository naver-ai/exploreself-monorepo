import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { useEffect } from 'react';
import { fetchUserInfo } from '../reducer';
import { Spin } from 'antd';
import * as rrweb from 'rrweb'
import { Http } from '../../../net/http';
import { SessionRecordingManager } from '../../../services/recording';

export const SignedInScreenFrame = (props: { withHeader: boolean }) => {
  const dispatch = useDispatch();

  const token = useSelector(state => state.auth.token)

  const isLoadingUserInfo = useSelector(
    (state) => state.explore.isLoadingUserInfo
  );

  useEffect(()=>{
    let stopRecording: (()=>void) | undefined = undefined
    let sessionId: string
    if(token != null){
      Http.axios.post("/user/browser_sessions/start", null, {headers: Http.makeSignedInHeader(token)}).then(resp => {
        sessionId = resp.data.sessionId
        stopRecording = rrweb.record({
          emit(e, isCheckout) {
            SessionRecordingManager.instance.pushEvent(e)
          },
        })

        SessionRecordingManager.instance.startLogUploading(token, sessionId)
      })      
    }
      

    return () => {
      if(token != null){
        console.log(sessionId)
        Http.axios.post("/user/browser_sessions/end", {sessionId}, {headers: Http.makeSignedInHeader(token)}).then()      
      }

      stopRecording?.()
      SessionRecordingManager.instance.stopLogUploading()
    }
  }, [token])

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, []);

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
