import { Http } from "../net/http";

const getKeywords = async (token: string, qid: string): Promise<string[] | null> => {
  try {
    const response = await Http.axios.get(`/generate/keywords/${qid}`,{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.keywords.map((item: {keyword: string, rationale: string}) => item.keyword)
  } catch (err) {
    console.log("Err in fetching keywords: ", err);
    return null;
  }
}

export default getKeywords;