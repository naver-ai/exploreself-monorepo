import { Http } from '../net/http';
import { InteractionType, InteractionBase } from '@core';

export const postInteractionData = async(token: string, interaction_type: InteractionType, interaction_data: Record<string, any>, metadata: Record<string, any>) => {
  try {
    const isLogged = await Http.axios.post('/interaction', {
      interaction_type: interaction_type,
      interaction_data: interaction_data,
      metadata: metadata
    }, 
    {
      headers: Http.makeSignedInHeader(token),
    })
    return (isLogged as any).success
  } catch (err) {
    console.log("Err in logging interaction data: ", err)
    return null
  }
}