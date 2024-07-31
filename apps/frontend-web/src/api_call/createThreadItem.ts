import { Http } from '../net/http';

const createThreadItem = async (
  token: string,
  theme: string
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(
      `/thread/createThreadItem`,
      {
        theme: theme,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.threadid;
  } catch (err) {
    console.log('Err in fetching questions: ', err);
    return null;
  }
};
export default createThreadItem;
