import { Http } from "../net/http";

const getQuestions = async (token: string, tid: string) => {
  try {
    const response = await Http.axios.post(`/question/getQuestions`,{
      tid: tid
    }, {
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.questions
  } catch (err) {
    console.error("Error in getting questions: ", err)
    return null
  }
}

export default getQuestions;