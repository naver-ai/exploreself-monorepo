import { IScaffoldingData } from '../../config/types';
import synthesizeThread from './synthesizeThread';
import { Http } from '../../net/http';

const saveThreadItem = async (
  tid: string,
  uid: string,
  question: string,
  scaffoldingData: IScaffoldingData,
  userResponse: string
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(`/thread/saveThreadItem`, {
      tid: tid,
      question: question,
      scaffoldingData: scaffoldingData,
      response: userResponse,
    });
    // console.log("RESP: ", response.data)
    const synthesized = await synthesizeThread(tid, uid);
    // synthesized를 user에게 보여줄 수도 있음.
    const updatedResponse = await Http.axios.post(`/thread/saveSynthesized`, {
      synthesized: synthesized,
    });
    return updatedResponse.data.success;
  } catch (err) {
    console.log('Err in saving thread item: ', err);
    return null;
  }
};
export default saveThreadItem;
