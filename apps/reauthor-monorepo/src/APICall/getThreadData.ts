import axios from "axios";

const getThreadData = async (tid: string) => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/thread/getThreadData`, {
      tid: tid
    })
    return response.data.threadData;
  } catch (err) {
    console.log("Err in fetching thread data: ", err);
    return null;
  }

}

export default getThreadData;