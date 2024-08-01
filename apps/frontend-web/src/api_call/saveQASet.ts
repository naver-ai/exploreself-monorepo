import { IQASetBase, IQASetWithIds } from '@core';
import { Http } from '../net/http';

export const selectQuestion = async (token: string, qid: string) => {
  try {
    const resp = await Http.axios.put(
      `/question/select/${qid}`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return resp.data.qaSet;
  } catch (err) {
    console.log('Err in selectQuestion: ', err);
    return null;
  }
};

export const unSelectQuestion = async (token: string, qid: string) => {
  try {
    const resp = await Http.axios.put(
      `/question/unselect/${qid}`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return resp.data.qaSet;
  } catch (err) {
    console.log('Err in selectQuestion: ', err);
    return null;
  }
};

export const updateKeywords = async (
  token: string,
  qid: string,
  keywords: Array<string>
) => {
  try {
    const resp = await Http.axios.post(
      `/response/updateKeywords`,
      {
        qid: qid,
        keywords: keywords,
        selected: true,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return resp.data.qaSet;
  } catch (err) {
    console.log('Err in updateKeywords: ', err);
    return null;
  }
};

export const updateResponse = async (
  token: string,
  qid: string,
  response: string
) => {
  try {
    const resp = await Http.axios.put(
      `/response/${qid}`,
      {
        response: response,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return resp.data.qaSet;
  } catch (err) {
    console.log('Err in updateResponse: ', err);
    return null;
  }
};

export const saveComment = async (
  token: string,
  qid: string,
  comment: string
) => {
  try {
    const response = await Http.axios.put(
      `/response/comment/${qid}`,
      {
        comment: comment,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response;
  } catch (err) {
    console.log('Err in saveComment: ', err);
    return null;
  }
};

export const saveQASetArray = async (
  token: string,
  tid: string,
  QAList: Array<IQASetBase>
) => {
  try {
    const response = await Http.axios.post(
      `/response/saveQASetArray`,
      {
        tid: tid,
        qalist: QAList,
      },
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.success;
  } catch (err) {
    console.log('Err in saving QASetArray: ', err);
    return null;
  }
};
