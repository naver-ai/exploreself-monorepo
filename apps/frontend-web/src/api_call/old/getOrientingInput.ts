import { Http } from '../../net/http';

const getOrientingInput = async (tid: string): Promise<string | null> => {
  try {
    const response = await Http.axios.post(`/thread/getOrientingInput`, {
      tid: tid,
    });
    return response.data.orientingInput;
  } catch (err) {
    console.error('Error in getOrientingInpur: ', err);
    return null;
  }
};

export default getOrientingInput;
