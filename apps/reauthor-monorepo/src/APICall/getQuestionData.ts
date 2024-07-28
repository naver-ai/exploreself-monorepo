import { Http } from "../net/http";

const getQuestionData = async (token: string, qid: string) => {
  try {
    const response = await Http.axios.post(`/question/getQuestionData`,{
      qid: qid
    }, {
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.qData
  } catch (err) {
    console.error("Error in getting question data: ", err)
    return null
  }
}

export default getQuestionData;