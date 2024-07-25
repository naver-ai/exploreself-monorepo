import { IUser } from "../Config/interface";
import { Http } from "../net/http";

const getUserInfo = async (uid: string): Promise<IUser | null> => {
  try {
    const response = await Http.axios.post(`/user/getUserInfo`,{
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