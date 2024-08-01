import { Http } from "../net/http";

export const getThreadData = async (token: string, tid: string) => {
  try {
    const response = await Http.axios.get(`/thread/${tid}`, {
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.threadData;
  } catch (err) {
    console.log("Err in fetching thread data: ", err);
    return null;
  }

}

export const getThreadIdList = async (token: string) => {
  try {
    const response = await Http.axios.get(`/user/thread_ids`,{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.threadRef
  } catch (err) {
    console.log("Err in fetching thread id list: ", err);
    return null;
  }
}

