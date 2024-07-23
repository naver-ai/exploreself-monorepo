import axios from "axios";
import { IThreadItem } from "../Config/interface";

const getThreadTitleList = async (tids: string[]): Promise<IThreadItem[] | null>=> {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/getThreadTitleList`, {
      tids: tids
    })
    return response.data.themes;
  } catch (err) {
    console.log("Err in fetching thread title list: ", err);
    return null;
  }
}

export default getThreadTitleList;