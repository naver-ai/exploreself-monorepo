import { IThreadItem } from "../../Config/interface";
import { Http } from "../../net/http";

const getThreadTitleList = async (tids: string[]): Promise<IThreadItem[] | null>=> {
  try {
    const response = await Http.axios.post(`/thread/getThreadTitleList`, {
      tids: tids
    })
    return response.data.themes;
  } catch (err) {
    console.log("Err in fetching thread title list: ", err);
    return null;
  }
}

export default getThreadTitleList;