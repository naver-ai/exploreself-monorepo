import { IQASetBase } from "@core";
import { Http } from "../net/http";

const saveQASet = async (token: string, tid: string, QAList: Array<IQASetBase>) => {
  try {
    const response = await Http.axios.post(`/response/saveQASet`, {
      tid: tid,
      qalist: QAList
    },{
      headers: Http.makeSignedInHeader(token)
    })
    return response.data.success;
  } catch (err) {
    console.log("Err in fetching thread data: ", err);
    return null;
  }

}

export default saveQASet;