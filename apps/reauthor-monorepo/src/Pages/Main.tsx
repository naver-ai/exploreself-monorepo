import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {IThreadItem, IUser} from '../Config/interface'
import getUserInfo from "../APICall/getUserInfo"
import {Sheet} from 'react-modal-sheet'
import Sidebar from "../Components/New/Sidebar/Sidebar";
import ThemeBox from "../Components/New/ThemeBox/ThemeBox"
import ThreadBox from "../Components/New/ThreadBox/ThreadBox";
import getThreadList from '../APICall/getThreadList'
import { Button, Divider } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import { useSelector } from "../Redux/hooks";



const Main = () => {

  const [userInfo, setUserInfo] = useState<IUser | null>(null)
  const [isOpen, setOpen] = useState(false)
  const [threadRefList, setThreadRefList] = useState<string[] | null>(null)
  const [refresh, setRefresh] = useState(false)
  const workingThread = useSelector((state) => state.userInfo.working_thread)
  const workingState = workingThread.tid != ''
  const uid = useSelector((state) => state.userInfo.userId)
  // console.log("WT ", workingThread)

  const fetchInitInfo = async () => {
    try {
      const data = await getUserInfo(uid!);
      console.log("UID: ", uid)
      setUserInfo(data);
      if (data){
        const threadList = await getThreadList(data._id);
        if(threadList) {
          setThreadRefList(threadList)
          console.log("REF: ", threadList)
        }
      };
    } catch (err) {
      console.log("ERR: ", err)
    } 
  }

  const handleThreadCreated = useCallback(() => {
    setRefresh(!refresh)
  }, [refresh])


  useEffect(() => {
    fetchInitInfo();
  }, [refresh])

  
  return(
    <div className="flex flex-row">
      <div className="basis-1/6">
        <Sidebar threadRef={threadRefList} onThreadCreated={handleThreadCreated}/>
        <Divider/>
        <Button shape="circle" icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}/>
      </div>
      <div className="basis-2/3">
        <div>Self narrative</div>
        {userInfo? userInfo.initial_narrative: "Loading"}
        
        {/* <SelectedThemes/> */}
        <div>
          {threadRefList? threadRefList.map(threadRef => <div className="py-1"><ThreadBox theme={workingThread.theme} tid={threadRef}/></div>): <div>Loading</div>}
        </div>
        {!workingState? <Button shape="circle" icon={<PlusCircleOutlined />} onClick={() => setOpen(true)}/>: <div></div>}
        
        <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent='content-height'>
          <Sheet.Container>
            {/* <Sheet.Header /> */}
            <div className="flex flex-row">
          <div className="basis-1/6"></div>
          <div className="basis-2/3">
          <button onClick={() => setOpen(false)}>Close Sheet</button>
            <Sheet.Content><ThemeBox onThreadCreated={handleThreadCreated}/></Sheet.Content>
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

export default Main;