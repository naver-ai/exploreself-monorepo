import axios from "axios"

const getScaffoldingKeywords = async (uid: string, question: string): Promise<string[] | null> => {
  try {
    const response = await axios.post(`${(import.meta as any).env.VITE_BACKEND}/response/generateKeywords`, {
      uid: uid,
      question: question,
    })
    return response.data.granularItems.map((obj: {item: string, rationale: string}) => obj.item);
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}

export default getScaffoldingKeywords;