import { ChatOpenAI, OpenAI, ChatOpenAICallOptions, OpenAICallOptions } from '@langchain/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../../config/config';

const generatePlausibleAnswers = async (questionInput: string, contextInput: string | any) => {
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(
    `Given the following context, provide 10 different plausible answers for the question. 
    Context: {context},\n
    Following question is the question: `
  )
  const humanMessage = HumanMessagePromptTemplate.fromTemplate('{question}')

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const context = contextInput;
  const question = questionInput;
  const answerSetSchema = z.object({
    answerSet: z.array(z.object({
      answer: z.string().describe(""),
      rationale: z.string().describe("")
    }))
  })

  const structuredLlm = chatModel.withStructuredOutput(answerSetSchema)
  console.log("Q: ", question)


  const chain = finalPromptTemplate.pipe(structuredLlm)
  const result = await chain.invoke({context: context, question: question})
  return result;
}

export default generatePlausibleAnswers