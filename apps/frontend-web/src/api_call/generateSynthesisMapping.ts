import { Http } from '../net/http';

const generateSynthesisMappings = async (
  token: string,
) => {
  try {
    const response = await Http.axios.put(
      `/generate/synthesis_mappings`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.synthesisMappings;
  } catch (err) {
    console.error('Error in getting final synthesis mappings: ', err);
    return null;
  }
};

export default generateSynthesisMappings;
