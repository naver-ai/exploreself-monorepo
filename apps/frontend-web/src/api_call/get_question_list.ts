import { IQASetWithIds } from '@core';
import { Http } from '../net/http';

export const getSelectedQuestionList = async (
  token: string,
  tid: string
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.get(`/question/selected/${tid}`, {
      headers: Http.makeSignedInHeader(token),
    });
    return (response as any).data.selectedQuestionList;
  } catch (err) {
    console.log('Err in getSelectedQuestionList: ', err);
    return null;
  }
};

export const getUnselectedQuestionList = async (
  token: string,
  tid: string
): Promise<string[] | null> => {
  try {
    const response = await Http.axios.get(`/question/unselected/${tid}`, {
      headers: Http.makeSignedInHeader(token),
    });
    return (response as any).data.unSelectedQuestionList;
  } catch (err) {
    console.log('Err in getUnselectedQuestionList: ', err);
    return null;
  }
};
