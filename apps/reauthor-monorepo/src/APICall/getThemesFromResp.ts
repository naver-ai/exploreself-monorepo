import axios from "axios"

const getThemesFromResp = async (uid: string) => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/theme/generateThemesFromResp`,{
      uid: uid
    })
    return response.data.themes
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error("Error in getting Initial Themes: ", err)
    return null
  }
}

export default getThemesFromResp;