import { Http } from "../net/http";

const generateQuestions = async (token: string, tid: string, opt: number=1) => {
  try {
    const response = await Http.axios.get(`/generate/question/${tid}?opt=${opt}`,{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.questions
  } catch (err) {
    console.error("Error in getting questions: ", err)
    return null
  }
}

export default generateQuestions;