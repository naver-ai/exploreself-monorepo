import { Http } from "../net/http";

const createThreadItem = async (uid: string, theme: string): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(`/thread/createThreadItem`, {
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