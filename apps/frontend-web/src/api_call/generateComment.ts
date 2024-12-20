import { Http } from '../net/http';

const generateComment = async (
  token: string,
  agendaId: string,
  tid: string,
  qid: string,
  response: string
) => {
  try {
    const resp = await Http.axios.post(
      `/agendas/${agendaId}/themes/${tid}/questions/${qid}/comments/generate`,
      {
        response: response,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return resp.data.comments;
  } catch (err) {
    console.error('Error in generating comments: ', err);
    return null;
  }
};

export default generateComment;
