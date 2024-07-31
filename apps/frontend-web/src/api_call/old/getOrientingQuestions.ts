import { Http } from '../../net/http';

const getOrientingQuestions = async (
  theme: string,
  uid: string
): Promise<string[] | null> => {
  try {
    const response = Http.axios.post(`/question/generateOrienting`, {
      uid: uid,
      selected_theme: theme,
    });
    return (await response).data.questions;
  } catch (err) {
    console.log('Err in fetching questions: ', err);
    return null;
  }
};

export default getOrientingQuestions;
