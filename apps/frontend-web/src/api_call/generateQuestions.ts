import { Http } from '../net/http';

const generateQuestions = async (
  token: string,
  tid: string,
  opt: number = 1,
  prevQ: Array<string> =[]
) => {
  try {
    const response = await Http.axios.post(
      `/generate/question/${tid}?opt=${opt}`,
      {
        prevQ: prevQ
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.questions;
  } catch (err) {
    console.error('Error in getting questions: ', err);
    return null;
  }
};

export default generateQuestions;
