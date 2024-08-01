import { Http } from '../../net/http';

const getScaffoldingQuestions = async (
  question: string,
  uid: string
): Promise<{ question: string; choices: string[] }[] | null> => {
  try {
    // TODO: Add uid
    const response = await Http.axios.post(
      `/response/getScaffoldingQuestions`,
      {
        question: question,
        uid: uid,
      }
    );
    return response.data.questions;
  } catch (err) {
    console.log('Err in fetching scaffolding questions: ', err);
    return null;
  }
};

export default getScaffoldingQuestions;
