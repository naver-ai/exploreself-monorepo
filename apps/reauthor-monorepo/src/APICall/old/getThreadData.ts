import { Http } from "../../net/http";

const getThreadData = async (tid: string) => {
  try {
    const response = await Http.axios.post(`/thread/getThreadData`, {
      tid: tid
    })
    return response.data.threadData;
  } catch (err) {
    console.log("Err in fetching thread data: ", err);
    return null;
  }

}

export default getThreadData;