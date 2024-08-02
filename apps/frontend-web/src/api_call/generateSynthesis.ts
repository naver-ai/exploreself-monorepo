import { Http } from '../net/http';

const generateSynthesis = async (
  token: string,
) => {
  try {
    const response = await Http.axios.put(
      `/generate/synthesis`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.synthesis;
  } catch (err) {
    console.error('Error in getting synthesis: ', err);
    return null;
  }
};

export default generateSynthesis;
