import { Http } from '../../net/http';

const getThemesFromResp = async (uid: string) => {
  try {
    const response = await Http.axios.post(`/theme/generateThemesFromResp`, {
      uid: uid,
    });
    return response.data.themes;
    // return response.data.themes.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme)
  } catch (err) {
    console.error('Error in getting Initial Themes: ', err);
    return null;
  }
};

export default getThemesFromResp;
