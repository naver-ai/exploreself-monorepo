import axios from "axios"

const getSocraticQuestions = async (theme: string, uid: string, orienting_input:string): Promise<string[] | null> => {
  try {
    const response = axios.post(`${(import.meta as any).env.VITE_BACKEND}/question/generateSocratic`, {
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

export default getSocraticQuestions;