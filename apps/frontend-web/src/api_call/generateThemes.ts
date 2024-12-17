import { Http } from '../net/http';

const getThemeRecommendation = async (token: string, agendaId: string, prevThemes: string[] = [], opt: number) => {
  try {
    const response = await Http.axios.post(`/agendas/${agendaId}/themes/recommendation`, {
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

export default getThemeRecommendation;
