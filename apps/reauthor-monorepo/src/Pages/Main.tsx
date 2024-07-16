import axios from "axios";
import { useEffect, useState } from "react";
import {IUser} from '../../../utils/schemaInterface'
import PotentialThemes from '../Components/PotentialThemes/PotentialThemes';
import getUserInfo from "../Utils/getUserInfo"
import SelectedThemes from "../Components/SelectedThemes/SelectedThemes";
import BookMark from "../Components/SelectedThemes/BookMark";
import { useSelector } from "react-redux";
import { IRootState } from "../Redux/store";

const Main = () => {

  const [userInfo, setUserInfo] = useState<IUser | null>(null)
  const reduxUserInfo = useSelector((state: IRootState) => state.userInfo)

  useEffect(() => {

    const fetchUserInfo = async () => {
      const data = await getUserInfo();
      setUserInfo(data);
    };

    fetchUserInfo();
  }, [])
  
  return(
    <div>
      Self narrative: {userInfo? userInfo.selfNarrative: "Loading"}
      {/* Value set: {reduxUserInfo? reduxUserInfo.value_set: "Loading"}
      Background: {reduxUserInfo? reduxUserInfo.background: "Loading"} */}
      <BookMark/>
      <SelectedThemes/>
      <PotentialThemes userInfo={userInfo}/>
    </div>
  )
}

export default Main;