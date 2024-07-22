import axios from "axios";
import { IThreadItem } from "../Config/interface";
const getThreadList = async (uid: string): Promise<string[] | null>=> {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/getThreadList`, {
      uid: uid
    })
    return response.data.threadRef;
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}

export default getThreadList;