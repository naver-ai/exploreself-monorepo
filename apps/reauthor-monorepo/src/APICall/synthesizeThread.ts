import axios from "axios";
import { IThreadItem } from "../Config/interface";

const synthesizeThread = async (tid: string, uid: string): Promise<string[] | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/synthesizeThread`, {
      tid: tid,
      uid: uid
    })
    console.log("synthesized: ", response.data)
    return response.data.synthesized;
  } catch (err) {
    console.log("Err in fetching synthesizedThreadData: ", err);
    return null;
  }
}
export default synthesizeThread;