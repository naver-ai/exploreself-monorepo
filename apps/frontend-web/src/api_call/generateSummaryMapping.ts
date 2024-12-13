import { Http } from '../net/http';

export const generateSummaryMappings = async (
  token: string,
) => {
  try {
    const response = await Http.axios.put(
      `/generate/summary_mappings`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.summaryMappings;
  } catch (err) {
    console.error('Error in getting final summary mappings: ', err);
    return null;
  }
};
