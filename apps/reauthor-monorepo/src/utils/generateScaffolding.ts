import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { chatModel } from "../config"
import { z } from "zod";

const generateGranularItems = async (questionInput: string, history_log: string | any, granularity: number) => {

  let granularity_instructions;
  switch (granularity) {
    case 1:
      granularity_instructions = 'keywords'
    case 2:
      granularity_instructions = 'phrases of around 3~5 words'
  }
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(
    `Given the following context, provide 10 different plausible {granularity_instructions} which might act as a 'hint' that might be related to answering the question. 
    Context: {context},\n
    Following is the question: `
  )
  const humanMessage = HumanMessagePromptTemplate.fromTemplate('{question}')

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  // const context = history_log.join('');
  const context = history_log;
  const question = questionInput;
  const answerSetSchema = z.object({
    granularItemSet: z.array(z.object({
      item: z.string().describe(""),
      rationale: z.string().describe("")
    }))
  })

  const structuredLlm = chatModel.withStructuredOutput(answerSetSchema)
  console.log("Q: ", question)

  const chain = finalPromptTemplate.pipe(structuredLlm)
  const result = await chain.invoke({context: context, question: question, granularity_instructions: granularity_instructions})
  return result;
}

export {generateGranularItems}