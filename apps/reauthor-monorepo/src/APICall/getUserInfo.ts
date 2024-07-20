import axios from "axios"
import { IUser } from "apps/utils/schemaInterface";

const getUserInfo = async (): Promise<IUser | null> => {
  try {
    const response = await axios.get(`http://localhost:3333/user/getUserInfo`);
    console.log("RESPONSE: ", response.data)
    return response.data.user
  } catch (err) {
    console.error("Error in making request: ", err)
    return null
  } 
}

export default getUserInfo;