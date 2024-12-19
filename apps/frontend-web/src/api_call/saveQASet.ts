import { IQASetBase, IQASetWithIds, InteractionBase } from '@core';
import { Http } from '../net/http';

export async function selectQuestionById(token: string, aid: string, tid: string, qid: string): Promise<IQASetWithIds | null> {
  try {
    const resp = await Http.axios.put(
      `/agendas/${aid}/themes/${tid}/questions/${qid}/select`,
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

export async function unSelectQuestion(token: string, aid: string, tid: string, qid: string): Promise<IQASetWithIds | null> {
  try {
    const resp = await Http.axios.put(
      `/agendas/${aid}/themes/${tid}/questions/${qid}/unselect`,
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

export const updateResponse = async (
  token: string,
  aid: string, tid: string,
  qid: string,
  response: string,
  interaction: InteractionBase
) => {
  try {
    const resp = await Http.axios.post(
      `/agendas/${aid}/themes/${tid}/questions/${qid}/response`,
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
