import axios from "axios";
import { useEffect, useState } from "react";
import {IUser} from '../../../utils/schemaInterface'
import PotentialThemes from '../Components/PotentialThemes/PotentialThemes';
import getUserInfo from "../Utils/getUserInfo"
import SelectedThemes from "../Components/SelectedThemes/SelectedThemes";
import BookMark from "../Components/SelectedThemes/BookMark";
import { useSelector } from "react-redux";
import { IRootState } from "../Redux/store";
import {Sheet} from 'react-modal-sheet'

const Main = () => {

  const [userInfo, setUserInfo] = useState<IUser | null>(null)
  const reduxUserInfo = useSelector((state: IRootState) => state.userInfo)
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
      <div className="basis-1/6"><BookMark/></div>
      <div className="basis-2/3">
        Self narrative: {userInfo? userInfo.selfNarrative: "Loading"}
        {/* Value set: {reduxUserInfo? reduxUserInfo.value_set: "Loading"}
        Background: {reduxUserInfo? reduxUserInfo.background: "Loading"} */}
        <SelectedThemes/>
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
      
      <div className="basis-1/6">Value Set: {userInfo? reduxUserInfo.value_set.join(', '): ""}</div>
      
      
    </div>
  )
}

export default Main;