import axios from "axios"

const saveOrientingInput = async (tid: string, orientingInput: string): Promise<boolean | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/response/saveOrientingInput`, {
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