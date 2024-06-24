import { ChatOpenAI } from '@langchain/openai';
import {ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate} from "@langchain/core/prompts"
import {SystemMessage} from "@langchain/core/messages"
import {z} from "zod";

const generateQuestions = async (history, user_input, mode) => {
  // mode: 1) 새로운 topic을 선택했을 때, 2) within context
  // TODO: mode setting 
  
  const model = new ChatOpenAI({
    model: "gpt-4"
  });
  const mode_prompt = mode? "새로운 topic을 선택했을 때 prompt":"within context prompt"
  const systemTemplate = `{mode_prompt} {history}` // TODO: design prompt
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = `{user_input}` // TODO: design prompt
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const questionSchema = z.object({
    questions: z.array(z.string())
  })
  
  const structuredLlm = model.withStructuredOutput(questionSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)

  const result = await chain.invoke({history: history, user_input: user_input, mode_prompt: mode_prompt})

  return result;
}

export default generateQuestions;