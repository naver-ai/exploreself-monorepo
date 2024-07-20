import axios from "axios";
import { useEffect, useState } from "react";
import {IUser} from '../../../utils/schemaInterface'
import PotentialThemes from '../Components/PotentialThemes/PotentialThemes';
import getUserInfo from "../APICall/getUserInfo"
import SelectedThemes from "../Components/SelectedThemes/SelectedThemes";
import BookMark from "../Components/SelectedThemes/BookMark";
import { useSelector } from "react-redux";
import { IRootState } from "../Redux/store";
import {Sheet} from 'react-modal-sheet'
import Sidebar from "../Components/New/Sidebar/Sidebar";
import QuestionSetup from "../Components/New/QuestionSetup/QuestionSetup";

const Main = () => {

  const [userInfo, setUserInfo] = useState<IUser | null>(null)
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {

    const fetchUserInfo = async () => {
      const data = await getUserInfo();
      console.log("VALUE: ", userInfo)
      setUserInfo(data);
    };

    fetchUserInfo();
  }, [])
  
  return(
    <div className="flex flex-row">
      <div className="basis-1/6"><Sidebar/></div>
      <div className="basis-2/3">
        Self narrative: {userInfo? userInfo.initial_narrative: "Loading"}
        <QuestionSetup/>
        {/* <SelectedThemes/> */}
        
        <button onClick={() => setOpen(true)}>Open Sheet</button>
        <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent='content-height'>
          <Sheet.Container>
            {/* <Sheet.Header /> */}
            <div className="flex flex-row">
          <div className="basis-1/6"></div>
          <div className="basis-2/3">
          <button onClick={() => setOpen(false)}>Close Sheet</button>
            <Sheet.Content><PotentialThemes userInfo={userInfo}/></Sheet.Content>
            </div>
          <div className="basis-1/6"></div>
          </div>
          </Sheet.Container>
          <Sheet.Backdrop />
        </Sheet>       
      </div>
      
      <div className="basis-1/6">Value Set: {userInfo? userInfo.value_set.join(', '): ""}</div>
      
      
    </div>
  )
}

export default Main;