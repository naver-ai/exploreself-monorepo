import axios from "axios"

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