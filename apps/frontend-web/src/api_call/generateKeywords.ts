import { Http } from '../net/http';

const generateKeywords = async (
  token: string,
  agendaId: string,
  tid: string,
  qid: string,
  opt: number = 1
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(
      `/agendas/${agendaId}/themes/${tid}/quesions/${qid}/keywords/generate`,
      {
        opt
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.keywords.map(
      (item: { keyword: string; rationale: string }) => item.keyword
    );
  } catch (err) {
    console.log('Err in fetching keywords: ', err);
    return null;
  }
};

export default generateKeywords;
