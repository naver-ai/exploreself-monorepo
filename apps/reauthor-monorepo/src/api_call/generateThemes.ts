import { Http } from "../net/http";

const generateThemes = async (token: string) => {
  try {
    const response = await Http.axios.get(`/generate/themes`,{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.themes
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error("Error in getting Themes: ", err)
    return null
  }
}

export default generateThemes;