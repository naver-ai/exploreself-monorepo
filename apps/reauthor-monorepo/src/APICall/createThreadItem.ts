import axios from "axios";

const createThreadItem = async (uid: string, theme: string): Promise<string[] | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/createThreadItem`, {
      uid: uid,
      theme: theme,
    })
    return response.data.threadid;
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}
export default createThreadItem;