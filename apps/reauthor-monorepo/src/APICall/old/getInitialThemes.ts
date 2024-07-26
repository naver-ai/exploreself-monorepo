import { Http } from "../../net/http";

const getInitialThemes = async (uid: string) => {
  try {
    const response = await Http.axios.post(`/theme/generateInitialThemes`,{
      uid: uid
    })
    return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem)
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error("Error in getting Initial Themes: ", err)
    return null
  }
}

export default getInitialThemes;