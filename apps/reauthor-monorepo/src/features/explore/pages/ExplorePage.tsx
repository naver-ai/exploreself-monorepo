import { useEffect, useState } from "react";
import {Sheet} from 'react-modal-sheet'
import Sidebar from "../components/Sidebar";
import ThemeBox from "../components/ThemeBox"
import ThreadBox from "../components/ThreadBox";
import { Button, Divider, Progress, Spin, Card, FloatButton, Drawer } from "antd";
import { PlusCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "../../../redux/hooks";
import { fetchUserInfo } from "../reducer";
import { Navigate } from "react-router-dom";
import { UserAvatar } from "../components/UserAvatar";


export const ExplorerPage = () => {

  // TODO: get threadIds from DB, not redux
  const [isOpen, setOpen] = useState<boolean>(false)
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
          <FloatButton
            icon={<BulbOutlined />}
            description="주제들 보기"
            shape="square"
            className="fixed left-6 bottom-6 w-20 p-3"
            type="primary"
            onClick={() => setOpen(true)}
            />
        </div>
        <div className="flex-1 overflow-y-auto relative">
          <Drawer
            placement="left"
            closable={false}
            onClose={() => setOpen(false)}
            open={isOpen}
            getContainer={false}
            rootStyle={{ position: 'absolute', height: '100vh' }}
          >
            <ThemeBox setOpen={setOpen}/>
          </Drawer>
          <div className="container px-4 md:px-8 py-4 md:py-8">
            
            <Card title="처음 적었던 고민">
              <span className="text-gray-600 leading-7">
                {initialNarrative}
              </span>
            </Card>
            {threadIds? threadIds.map(threadRef => <div key={threadRef} className="py-1"><ThreadBox /*TODO theme={workingThread.theme}*/ tid={threadRef}/></div>): <div>Loading</div>}

          </div>
          
          {/* <div className="basis-1/6">Value Set: {userInfo? userInfo.value_set.join(', '): ""}</div> */}
          
          
        </div>
      </div>
  )
}