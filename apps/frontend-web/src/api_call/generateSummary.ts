import { IMappedSummarySentence } from '@core';
import { Http } from '../net/http';

export async function generateSummary(
  token: string,
  agendaId: string
): Promise<Array<IMappedSummarySentence>|null> {
  try {
    const response = await Http.axios.put(
      `/agendas/${agendaId}/summarize`,
      {},
      {
        headers: Http.makeSignedInHeader(token),
      }
    );
    return response.data.summaryMappings;
  } catch (err) {
    console.error('Error in getting final summary: ', err);
    return null;
  }
};