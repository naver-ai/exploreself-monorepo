import { Http } from "../../net/http";

const saveOrientingInput = async (tid: string, orientingInput: string): Promise<boolean | null> => {
  try {
    const response = await Http.axios.post(`/response/saveOrientingInput`, {
      tid: tid,
      orientingInput: orientingInput
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in saving OrientingInput: ", err);
    return null;
  }
}

export default saveOrientingInput;