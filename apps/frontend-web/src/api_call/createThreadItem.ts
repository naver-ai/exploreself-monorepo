import { IThreadWithQuestionIds } from 'libs/ts-core/src/lib/model-types';
import { Http } from '../net/http';

const createThreadItem = async (
  token: string,
  agendaId: string,
  theme: string
): Promise<IThreadWithQuestionIds | null> => {
  try {
    const response = await Http.axios.post(
      `/agendas/${agendaId}/themes/new`,
      {
        theme: theme,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data;
  } catch (err) {
    console.log('Err in fetching questions: ', err);
    return null;
  }
};
export default createThreadItem;
