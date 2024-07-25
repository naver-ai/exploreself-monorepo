import { Http } from "../net/http";

const synthesizeThread = async (tid: string, uid: string): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(`/thread/synthesizeThread`, {
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