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
    const d = response.data;
    if(typeof d.createdAt === 'string'){
      d.createdAt = new Date(d.createdAt)
    }
    if(typeof d.updatedAt === 'string'){
      d.updatedAt = new Date(d.updatedAt)
    }

    return d

  } catch (err) {
    console.log('Err in fetching questions: ', err);
    return null;
  }
};
export default createThreadItem;
