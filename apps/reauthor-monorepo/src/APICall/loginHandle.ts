import axios from "axios"
import { IUser } from "../Config/interface";

const loginHandle = async (name: string, ucode: string): Promise<{success: boolean, user: IUser, new: boolean} | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/admin/login`, {
      name: name,
      ucode: ucode
    })
    return response.data;
  } catch (err) {
    console.log("Err in login: ", err);
    return null;
  }
}

export default loginHandle;