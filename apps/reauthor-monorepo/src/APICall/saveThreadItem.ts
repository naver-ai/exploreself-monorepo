import axios from "axios";
import { IScaffoldingData } from "../Config/interface";
const saveThreadItem = async (tid: string, question: string, scaffoldingData: IScaffoldingData, userResponse: string): Promise<string[] | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/saveThreadItem`, {
      tid: tid,
      question: question,
      scaffoldingData: scaffoldingData,
      response: userResponse
    })
    console.log("RESP: ", response.data)
    return response.data.threadid;
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}
export default saveThreadItem;