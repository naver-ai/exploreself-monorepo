import { Http } from "../net/http";

const setInitNarrative = async (token: string, narrative: string): Promise<boolean | null> => {
  try {
    const response = await Http.axios.post(`/user/setInitialNarrative`, {
      init_narrative: narrative
    },{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in setting narrative: ", err);
    return null;
  }
}

export default setInitNarrative;