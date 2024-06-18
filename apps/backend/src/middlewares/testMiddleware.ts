import { Request, Response, NextFunction } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import {HumanMessage, SystemMessage} from "@langchain/core/messages"
import {StringOutputParser} from "@langchain/core/output_parsers"

const testMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = {
      model: "gpt-4"
    }
    console.log("REQ: ", req)
    const model = new ChatOpenAI(options);
    const messages = [
      new SystemMessage("Translate the following from English into Italian"),
      new HumanMessage("hi")
    ];
    const parser = new StringOutputParser
    const result = await model.invoke(messages);
    const return_result = await parser.invoke(result)
    
    console.log("RESULT: ", return_result)
    res.json({result: return_result})
  } catch (error) {
    console.error("Error invoking model: ", error);
    next(error)
  }
}

export default testMiddleware;