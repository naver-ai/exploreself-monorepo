import express, { Request, Response } from 'express';
import { ChatCompletionRequest, CompletionRequest } from '../utils/interfaces';
import hcxChatCompletionExecutor from '../utils/hcxChatCompletionExecutor';

const hcxChatCompMiddleware = async (req: Request, res: Response) => {

  const host = `https://clovastudio.apigw.ntruss.com`
  const hcx_api_key = process.env.HCX_API_KEY
  const hcx_api_key_primary_val = process.env.HCX_API_KEY_PRIMARY_VAL
  const hcx_request_id = process.env.HCX_REQUEST_ID

  const messages_input = [
    {
      "role":"system",
      "content":"다음 지시문을 보고, 빈칸 채우기 문제를 만들어줘.\n\n\n\n"},
    {
      "role":"user",
      "content":""
    },
    {
      "role":"assistant",
      "content":`지시문: 다음 문장에서 빈칸에 들어갈 단어를 채우세요.\n\n- 
      나는 ( )을/를 좋아합니다.\n\n빈칸 채우기 문제 : \n1. 나는 음악을 좋아합니다.\n2.
       나는 책을 좋아합니다.\n3. 나는 여행을 좋아합니다. 
       \n\n위와 같이 다양한 예시를 들어볼 수 있습니다.`
    }
  ]

  const completion_request: ChatCompletionRequest = {
    messages: messages_input,
    topP: 0.8,
    topK: 0,
    maxTokens: 256,
    temperature: 0.5,
    repeatPenalty: 5.0,
    stopBefore: [],
    includeAiFilters: true,
    seed:0
  }

  const completion_executor = new hcxChatCompletionExecutor(host, hcx_api_key, hcx_api_key_primary_val, hcx_request_id);
  try {
    const hcx_chatcomp_result = await completion_executor.execute(completion_request);
    console.log("HCX_CHAT_COMP_RESULT: ", hcx_chatcomp_result)
    res.json(hcx_chatcomp_result)
    // res.status(200).send('Request executed successfully');
  } catch (error) {
    res.status(500).send('Error executing request'); 
  }
}

export default hcxChatCompMiddleware;
