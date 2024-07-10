import axios from "axios";
import { useEffect, useState } from "react";
import {IUser} from '../../../../interface/schemaInterface'

const Main = () => {

  const [userInfo, setUserInfo] = useState<IUser | null>(null)

  useEffect(() => {
    axios.get(
      `http://localhost:3333/user/getUserInfo`
    ).then((res) => {
      setUserInfo(res.data.user)
    }).catch((error) => {
      console.error("Error in making request: ", error)
    })
  }, [])
  
  return(
    <div>
      Self narrative: {userInfo? userInfo.selfNarrative: "Loading"}
    </div>
  )
}

export default Main;