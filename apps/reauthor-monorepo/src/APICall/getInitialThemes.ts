import axios from "axios"
import { IUser } from "apps/utils/schemaInterface";

const getUserInfo = async (): Promise<IUser | null> => {
  try {
    const response = await axios.get(`http://localhost:3333/user/getUserInfo`);
    return response.data.user
  } catch (err) {
    console.error("Error in getting UserInfo: ", err)
    return null
  } 
}

const getInitialThemes = async () => {
  try {
    const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND}/question/generateInitialThemes`)
    return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem)
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error("Error in getting Initial Themes: ", err)
    return null
  }
}

export default getInitialThemes;