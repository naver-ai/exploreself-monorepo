import { Http } from "../net/http";

const getScaffoldingKeywords = async (token: string, uid: string, question: string): Promise<string[] | null> => {
  try {
    const response = await Http.axios.post(`/response/generateKeywords`, {
      question: question,
    },{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.granularItems.map((obj: {item: string, rationale: string}) => obj.item);
  } catch (err) {
    console.log("Err in fetching questions: ", err);
    return null;
  }
}

export default getScaffoldingKeywords;