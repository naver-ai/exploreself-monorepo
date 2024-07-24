import axios from "axios";
import { IScaffoldingData } from "../Config/interface";
import synthesizeThread from "./synthesizeThread";

const saveThreadItem = async (tid: string, uid: string, question: string, scaffoldingData: IScaffoldingData, userResponse: string): Promise<string[] | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/saveThreadItem`, {
      tid: tid,
      question: question,
      scaffoldingData: scaffoldingData,
      response: userResponse
    })
    // console.log("RESP: ", response.data)
    const synthesized = await synthesizeThread(tid, uid)
    // synthesized를 user에게 보여줄 수도 있음. 
    const updatedResponse = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/saveSynthesized`, {
      synthesized: synthesized
    })
    return updatedResponse.data.success;
  } catch (err) {
    console.log("Err in saving thread item: ", err);
    return null;
  }
}
export default saveThreadItem;