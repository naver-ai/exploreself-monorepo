import axios from "axios"

const genQuestions = async (theme: string, uid: string): Promise<string[] | null> => {
  try {
    const response = axios.post(`${(import.meta as any).env.VITE_BACKEND}/question/generateQuestions`, {
      uid: uid,
      selected_theme: theme,
    })
    return (await response).data.questions;
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}

export default genQuestions;