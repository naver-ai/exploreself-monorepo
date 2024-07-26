import { Http } from "../../net/http";

const setInitNarrative = async (uid: string, narrative: string): Promise<boolean | null> => {
  try {
    const response = await Http.axios.post(`/user/setInitialNarrative`, {
      uid: uid,
      init_narrative: narrative
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in setting narrative: ", err);
    return null;
  }
}

export default setInitNarrative;