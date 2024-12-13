import { Http } from '../net/http';

export const generateSummary = async (
  token: string,
) => {
  try {
    const response = await Http.axios.put(
      `/generate/summary`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.summary;
  } catch (err) {
    console.error('Error in getting final summary: ', err);
    return null;
  }
};