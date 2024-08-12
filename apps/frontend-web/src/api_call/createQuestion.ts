import { IQASetWithIds, IThreadWithQuestionIds } from 'libs/ts-core/src/lib/model-types';
import { Http } from '../net/http';

const createQuestion = async (
  token: string,
  question: string
): Promise<IQASetWithIds | null> => {
  try {
    const response = await Http.axios.post(
      `/question/new`,
      {
        question: question,
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
export default createQuestion;
