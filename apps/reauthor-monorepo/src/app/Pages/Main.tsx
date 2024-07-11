import axios from "axios";
import { useEffect, useState } from "react";
import {IUser} from '../../../../utils/schemaInterface'
import NewThemes from "../Components/newThemes";
import getUserInfo from "../Utils/getUserInfo";

const Main = () => {

  const [userInfo, setUserInfo] = useState<IUser | null>(null)

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
      <NewThemes userInfo={userInfo}/>
    </div>
  )
}

export default Main;