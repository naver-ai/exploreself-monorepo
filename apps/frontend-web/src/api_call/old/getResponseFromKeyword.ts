import { Http } from '../../net/http';

const getResponseFromKeyword = async (
  question: string,
  selected_keywords: string[],
  uid: string
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(`/response/generateSentences`, {
      question: question,
      selected_keywords: selected_keywords,
      uid: uid,
    });
    return response.data.generated_sentences;
  } catch (err) {
    console.log('Err in fetching sentence: ', err);
    return null;
  }
};

export default getResponseFromKeyword;
