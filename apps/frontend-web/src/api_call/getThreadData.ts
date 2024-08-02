import { Http } from '../net/http';

const getThreadData = async (token: string, tid: string) => {
  try {
    const response = await Http.axios.get(`/threads/${tid}`, {
      headers: Http.makeSignedInHeader(token),
    });
    return response.data.threadData;
  } catch (err) {
    console.log('Err in fetching thread data: ', err);
    return null;
  }
};

export default getThreadData;
