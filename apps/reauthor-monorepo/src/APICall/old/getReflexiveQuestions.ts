import { Http } from "../../net/http";

const getReflexiveQuestions = async (theme: string, uid: string, orienting_input:string): Promise<string[] | null> => {
  try {
    const response = Http.axios.post(`/question/generateSocratic`, {
      uid: uid,
      selected_theme: theme,
      orienting_input: orienting_input
    })
    return (await response).data.questions;
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}

export default getReflexiveQuestions;