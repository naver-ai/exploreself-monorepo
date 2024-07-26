import { Http } from "../../net/http"

const getThemeScaffoldingKeywords = async (uid: string, theme: string) => {
  try {
    const response = await Http.axios.post(`/response/getThemeScaffoldingKeywords`,{
      uid: uid,
      theme: theme
    })
    return response.data.scaffoldingSet
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error("Error in getThemeScaffoldingKeywords: ", err)
    return null
  }
}

export default getThemeScaffoldingKeywords;