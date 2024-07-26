import { Http } from "../net/http";

const getThemes = async (token: string, uid: string) => {
  try {
    const response = await Http.axios.post(`/theme/getThemes`,{
      uid: uid
    },{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.themes
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error("Error in getting Themes: ", err)
    return null
  }
}

export default getThemes;