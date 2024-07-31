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
import { UserAvatar } from "../components/UserAvatar";

export const ExplorerPage = () => {

  // TODO: get threadIds from DB, not redux
  const [isOpen, setOpen] = useState(false)
  const workingThread = useSelector((state) => state.explore.working_thread)
  const workingState = workingThread.tid != ''

  const initialNarrative = useSelector(state => state.explore.initial_narrative)
  const userName = useSelector(state => state.explore.name)
  const threadIds = useSelector(state => state.explore.threadRef)

  if(userName == null || userName.length == 0){
    return <Navigate to="/app/profile"/>
  }else if(initialNarrative == null || initialNarrative.length == 0){
    return <Navigate to="/app/narrative"/>
  } else return (
    (initialNarrative == null) ? <Navigate to="/app/narrative"/> :  
      <div className="h-screen flex justify-stretch">
        <div className="basis-1/6 min-w-[200px] lg:min-w-[300px] overflow-y-auto bg-white border-r-[1px]">
          <div className="flex justify-between p-2 items-center">
            <span className="text-sm font-bold">MeSense</span>
            <UserAvatar buttonClassName=""/>
          </div>
          <hr/>
          <Sidebar/>
          <Button shape="circle" icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}/>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="container px-4 md:px-8 py-4 md:py-8">
              <Card title="나의 고민">
                <span className="text-gray-600 leading-7">
                  {initialNarrative}
                </span>
              </Card>
            
            
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
      </div>
  )
}