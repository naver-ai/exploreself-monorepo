import { IThreadWithQuestionIds } from '@core';
import { Http } from '../../net/http';

const getThreadTitleList = async (
  token: string,
  tids: string[]
): Promise<IThreadWithQuestionIds[] | null> => {
  try {
    const response = await Http.axios.post(
      `/thread/getThreadTitleList`,
      {
        tids: tids,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.themes;
  } catch (err) {
    console.log('Err in fetching thread title list: ', err);
    return null;
  }
};

export default getThreadTitleList;
