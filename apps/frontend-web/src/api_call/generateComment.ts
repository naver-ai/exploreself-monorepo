import { responsiveArray } from 'antd/es/_util/responsiveObserver';
import { Http } from '../net/http';

const generateComment = async (
  token: string,
  qid: string,
  response: string
) => {
  try {
    const resp = await Http.axios.post(
      `/generate/comment/${qid}`,
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
