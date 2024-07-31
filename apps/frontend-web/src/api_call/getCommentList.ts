import { Http } from '../net/http';

const getCommentList = async (
  token: string,
  qid: string
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.get(`/question/comment/${qid}`, {
      headers: Http.makeSignedInHeader(token),
    });
    return response.data.commentList?.map((comment: any) => comment.content);
  } catch (err) {
    console.log('Err in fetching keywords: ', err);
    return null;
  }
};

export default getCommentList;
