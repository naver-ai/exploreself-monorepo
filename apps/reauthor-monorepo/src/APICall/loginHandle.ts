import { IUser } from "../Config/interface";
import { Http } from "../net/http";

const loginHandle = async (name: string, ucode: string, isKorean: boolean): Promise<{success: boolean, user: IUser, new: boolean} | null> => {
  try {
    const response = await Http.axios.post(`/admin/login`, {
      name: name,
      ucode: ucode,
      isKorean: isKorean
    })
    return response.data;
  } catch (err) {
    console.log("Err in login: ", err);
    return null;
  }
}


export default loginHandle;