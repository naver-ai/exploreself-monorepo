import { Http } from '../net/http';

const generatePrompt = async (
  token: string,
  qid: string,
  keyword: string,
  curr_response: string, 
  opt: number=3
) => {
  try {
    const resp = await Http.axios.post(
      `/generate/prompt/${qid}`,
      {
        qid: qid,
        keyword: keyword,
        curr_response: curr_response,
        opt: opt
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return resp.data.prompts;
  } catch (err) {
    console.error('Error in generating prompts: ', err);
    return null;
  }
};

export default generatePrompt;
