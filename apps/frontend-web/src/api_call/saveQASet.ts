import { IQASetBase, IQASetWithIds, InteractionBase } from '@core';
import { Http } from '../net/http';

export async function selectQuestionById(token: string, qid: string): Promise<IQASetWithIds | null> {
  try {
    const resp = await Http.axios.put(
      `/question/${qid}/select`,
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

export async function unSelectQuestion(token: string, qid: string): Promise<IQASetWithIds | null> {
  try {
    const resp = await Http.axios.put(
      `/question/${qid}/unselect`,
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
  response: string,
  interaction: InteractionBase
) => {
  try {
    const resp = await Http.axios.post(
      `/response/${qid}`,
      {
        response: response,
        interaction: interaction
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
