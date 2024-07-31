import { Http } from "../net/http";

const generateKeywords = async (token: string, qid: string, opt: number=1): Promise<string[] | null> => {
  try {
    const response = await Http.axios.get(`/generate/keywords/${qid}?opt=${opt}`,{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.keywords.map((item: {keyword: string, rationale: string}) => item.keyword)
  } catch (err) {
    console.log("Err in fetching keywords: ", err);
    return null;
  }
}

export default generateKeywords;