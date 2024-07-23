import axios from "axios"
import { IUser } from "../Config/interface";

const getUserInfo = async (uid: string): Promise<IUser | null> => {
  try {
    const response = await axios.post(`http://localhost:3333/user/getUserInfo`,{
      uid: uid
    });
    console.log("RESPONSE: ", response.data)
    return response.data.user
  } catch (err) {
    console.error("Error in making request: ", err)
    return null
  } 
}

export default getUserInfo;