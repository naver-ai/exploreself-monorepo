import { Http } from '../net/http';

const getUserInteractionData = async (token: string) => {
  try {
    const response = await Http.axios.get(`/interaction`, {
      headers: Http.makeSignedInHeader(token),
    });
    return response.data.interactionData;
  } catch (err) {
    console.log('Err in fetching interaction data: ', err);
    return null;
  }
};

export default getUserInteractionData;
