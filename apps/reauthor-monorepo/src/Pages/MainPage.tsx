import { useEffect, useState } from "react";
import {Sheet} from 'react-modal-sheet'
import Sidebar from "../Components/New/Sidebar/Sidebar";
import ThemeBox from "../Components/New/ThemeBox/ThemeBox"
import ThreadBox from "../Components/New/ThreadBox/ThreadBox";
import { Button, Divider } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "../Redux/hooks";
import { fetchUserInfo } from "../Redux/reducers/userSlice";

export const MainPage = () => {

  const [isOpen, setOpen] = useState(false)
  const workingThread = useSelector((state) => state.userInfo.working_thread)
  const workingState = workingThread.tid != ''

  const isLoadingUserInfo = useSelector(state => state.userInfo.isLoadingUserInfo)
  const initialNarrative = useSelector(state => state.userInfo.initial_narrative)
  const threadIds = useSelector(state => state.userInfo.threadRef)

  // console.log("WT ", workingThread)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [])

  
  return(
    <div>
      <div className="flex flex-row">
        <div className="basis-1/6">
          <Sidebar/>
          <Divider/>
          <Button shape="circle" icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}/>
        </div>
        <div className="basis-2/3">
          <div>Self narrative</div>
          {isLoadingUserInfo? "Loading" : initialNarrative}
          
          {/* <SelectedThemes/> */}
          <div>
            {threadIds? threadIds.map(threadRef => <div key={threadRef} className="py-1"><ThreadBox theme={workingThread.theme} tid={threadRef}/></div>): <div>Loading</div>}
          </div>
          {!workingState? <Button shape="circle" icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}/>: <div></div>}
          
          <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent='content-height'>
            <Sheet.Container>
              {/* <Sheet.Header /> */}
              <div className="flex flex-row">
            <div className="basis-1/6"></div>
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