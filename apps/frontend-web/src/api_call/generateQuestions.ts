import { Http } from '../net/http';

const generateQuestions = async (
  token: string,
  agendaId: string,
  tid: string,
  opt: number = 1,
  prevQuestions: Array<string> =[]
) => {
  try {
    const response = await Http.axios.post(
      `/agendas/${agendaId}/themes/${tid}/questions/generate`,
      {
        prevQuestions,
        opt
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
