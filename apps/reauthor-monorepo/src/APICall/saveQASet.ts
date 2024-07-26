import { Http } from "../net/http";

const saveQASet = async (tid: string, question: string, keywords: Array<string>, answer: string) => {
  try {
    const response = await Http.axios.post(`/response/saveQASet`, {
      tid: tid,
      question: question,
      keywords: keywords,
      response: answer
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in fetching thread data: ", err);
    return null;
  }

}

export default saveQASet;