import express, { Request, Response } from 'express';
import { ChatCompletionRequest, CompletionRequest } from './interface';
import hcxCompExecutor from '../newUtils/hcx/hcxCompExecutor';
import hcxChatCompletionExecutor from '../newUtils/hcx/hcxChatCompletionExecutor';

const hcxCompletion = async (req: Request, res: Response) => {

  const host = `https://clovastudio.apigw.ntruss.com`
  const hcx_api_key = process.env.HCX_API_KEY
  const hcx_api_key_primary_val = process.env.HCX_API_KEY_PRIMARY_VAL
  const hcx_request_id = process.env.HCX_REQUEST_ID

  // console.log("HCX_API: ", hcx_api_key)

  const text_input = "한국어: 사과\n영어: Apple\n한국어: 바나나"

  const completion_request: CompletionRequest = {
    start: "\n영어",
    stopBefore: ["\n한국어: "],
    text: text_input,
    includeAiFilters: true,
  }

  const completion_executor = new hcxCompExecutor(host, hcx_api_key, hcx_api_key_primary_val, hcx_request_id);
  try {
    const hcx_comp_result = await completion_executor.execute(completion_request);
    console.log("RESULT: ", hcx_comp_result.inputText, '\n', hcx_comp_result.outputText)

    res.json(hcx_comp_result)
    // res.status(200).send('Request executed successfully');
  } catch (error) {
    res.status(500).send('Error executing request'); 
  }
}

const hcxChatCompletion = async (req: Request, res: Response) => {

  const host = `https://clovastudio.apigw.ntruss.com`
  const hcx_api_key = process.env.HCX_API_KEY
  const hcx_api_key_primary_val = process.env.HCX_API_KEY_PRIMARY_VAL
  const hcx_request_id = process.env.HCX_REQUEST_ID

  const narrative_kor = `
  저는, 중학교 때부터 저는 항상 사람들의 이목에서 벗어나 저 혼자 조용히 일하는 것을 좋아했습니다. 
  사람들 눈에 띄지 않고, 조용히 성실히 일하는 것을 선호했고, 사회적 상호작용도 늘 절제되고 눈에 띄지 않았습니다. 
  그러나 최근에 제가 일하는 곳에서 저만의 이런 평온이 깨졌습니다. 예상치 못하게 저희 회사 메인 프로젝트의 리더로 선정되었기 때문이에요. 
  이 프로젝트는 회사에서 정말 중요한 프로젝트이고, 제가 부서 전체의 프레젠테이션을 맡게 되어, 평소 늘 피하고자 했던 스포트라이트 앞에 서게 되었습니다. 
  수많은 사람들 앞에서 발표하고 이끌어야 한다는 생각에, 저는 전에 경험해보지 못했던 극심한 두려움을 느끼게 되었고, 이 일을 앞두고 도통 밤에 잠을 자지 못하고 있어요.  
  `  

  const system_msg=`
  You are an assistant that helps user explore and examin one's personal narrative for them to understand it better, in an empowering way. 
  The user will share one's personal narrative with you. 
  Your task is to identify 10 themes that the user can explore further. 
  The themes that you elicit will be directly be delivered to the user themselves, and they should feel inviting for the users.  
  Do not assume the user's emotions or thoughts based on the situation described. 
  Please ensure that these themes are directly derived from the user's own words and expressions. 
  Instead, focus on using the exact language and phrases used by the user. 
  The themes should be framed in a way that would likely engage and be inviting the user and highlight important aspects of their experience.
  Also, it's important to use the user's expression as much as possible. 
  Never judge or assume anything that would stigmatize oneself. They will not feel inviting to explore further. 
  Also, for each theme, also retrieve the most relevant part (It could be sentence(s), phrase(s) in the narrative, with each theme) in Korean.
  `

  const messages_input = [
    {
      "role":"system",
      "content":system_msg},
    {
      "role":"user",
      "content":narrative_kor
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
    console.log("HCX_CHAT_COMP_RESULT: ", hcx_chatcomp_result.input, '\n', hcx_chatcomp_result.output)
    res.json(hcx_chatcomp_result)
    // res.status(200).send('Request executed successfully');
  } catch (error) {
    res.status(500).send('Error executing request'); 
  }
}

export {hcxCompletion, hcxChatCompletion};
