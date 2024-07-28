import { IQASetBase, IQASetWithIds } from "@core";
import { Http } from "../net/http";

export const updateQASet = async (token: string, qid: string, response: string, keywords: Array<string>) => {
  try {
    const resp = await Http.axios.post(`/response/updateQASet`, {
      qid: qid,
      response: response,
      selected: true,
      keywords: keywords
    },{
      headers: Http.makeSignedInHeader(token)
    })
    return resp.data.qaSet
  } catch (err){
    console.log("Err in updating QASet: ", err);
    return null;
  }
}
export const saveQASetArray = async (token: string, tid: string, QAList: Array<IQASetBase>) => {
  try {
    const response = await Http.axios.post(`/response/saveQASetArray`, {
      tid: tid,
      qalist: QAList
    },{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in saving QASetArray: ", err);
    return null;
  }

}