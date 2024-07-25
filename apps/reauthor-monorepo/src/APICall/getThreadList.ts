import { Http } from "../net/http";

const getThreadList = async (uid: string): Promise<string[] | null>=> {
  try {
    const response = await Http.axios.post(`/thread/getThreadList`, {
      uid: uid
    })
    return response.data.threadRef;
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}

export default getThreadList;