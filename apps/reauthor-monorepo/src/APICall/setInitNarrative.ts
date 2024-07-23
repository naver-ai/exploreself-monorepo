import axios from "axios"
import { IUser } from "../Config/interface";

const setInitNarrative = async (uid: string, narrative: string): Promise<boolean | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/user/setInitialNarrative`, {
      uid: uid,
      init_narrative: narrative
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in setting narrative: ", err);
    return null;
  }
}

export default setInitNarrative;