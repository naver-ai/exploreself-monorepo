import express, { Request, Response } from 'express';
import { ChatCompletionRequest, CompletionRequest } from '../utils/interfaces';
import hcxCompExecutor from '../utils/hcxCompExecutor';

const hcxCompMiddleware = async (req: Request, res: Response) => {

  const host = `https://clovastudio.apigw.ntruss.com`
  const hcx_api_key = process.env.HCX_API_KEY
  const hcx_api_key_primary_val = process.env.HCX_API_KEY_PRIMARY_VAL
  const hcx_request_id = process.env.HCX_REQUEST_ID

  console.log("HCX_API: ", hcx_api_key)

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
    console.log("HCX_COMP_RESULT: ", hcx_comp_result)
    res.json(hcx_comp_result)
    // res.status(200).send('Request executed successfully');
  } catch (error) {
    res.status(500).send('Error executing request'); 
  }
}

export default hcxCompMiddleware;
