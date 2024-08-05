import { Http } from '../net/http';

const generateThemes = async (token: string, prevThemes: string[] = [], opt: number) => {
  try {
    const response = await Http.axios.post(`/generate/themes`, {
      prevThemes: prevThemes,
      opt: opt
    },
    {
      headers: Http.makeSignedInHeader(token),
    });
    return response.data.themes;
  } catch (err) {
    console.error('Error in getting Themes: ', err);
    return null;
  }
};

export default generateThemes;
