import { useEffect, useState } from "react";
import {Sheet} from 'react-modal-sheet'
import Sidebar from "../components/Sidebar";
import ThemeBox from "../components/ThemeBox"
import ThreadBox from "../components/ThreadBox";
import { Button, Divider, Progress, Spin, Card } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "../../../redux/hooks";
import { fetchUserInfo } from "../reducer";
import { Navigate } from "react-router-dom";

export const ExplorerPage = () => {

  // TODO: get threadIds from DB, not redux
  const [isOpen, setOpen] = useState(false)
  const workingThread = useSelector((state) => state.explore.working_thread)
  const workingState = workingThread.tid != ''

  const isLoadingUserInfo = useSelector(state => state.explore.isLoadingUserInfo)
  const userId = useSelector(state => state.explore.userId)
  const initialNarrative = useSelector(state => state.explore.initial_narrative)
  const threadIds = useSelector(state => state.explore.threadRef)

  
  // Redirect to initial narrative page if no initial narrative.
  return (
    (userId != null && initialNarrative == null) ? <Navigate to="/app/narrative"/> :  
      <div className="flex flex-row px-4">
        <div className="basis-1/6  px-4 h-screen">
          <Sidebar/>
          <Button shape="circle" icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}/>
        </div>
        <div className="basis-5/6 overflow-y-auto h-screen px-4 pb-10">
          <div className="">
            <Card title="내 고민">
              {isLoadingUserInfo? "Loading" : initialNarrative}
            </Card>            
          </div>
          
          
          {/* <SelectedThemes/> */}
          {threadIds? threadIds.map(threadRef => <div key={threadRef} className="py-1"><ThreadBox /*TODO theme={workingThread.theme}*/ tid={threadRef}/></div>): <div>Loading</div>}
          
          <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent='content-height'>
            <Sheet.Container>
              {/* <Sheet.Header /> */}
              <div className="flex flex-row">
            <div className="basis-2/3">
            <button onClick={() => setOpen(false)}>Close Sheet</button>
              <Sheet.Content><ThemeBox/></Sheet.Content>
              </div>
            <div className="basis-1/6"></div>
            </div>
            </Sheet.Container>
            <Sheet.Backdrop />
          </Sheet>       
        </div>
        
        {/* <div className="basis-1/6">Value Set: {userInfo? userInfo.value_set.join(', '): ""}</div> */}
        
        
      </div>
  )
}