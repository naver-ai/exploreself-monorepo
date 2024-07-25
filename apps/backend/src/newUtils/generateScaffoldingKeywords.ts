import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { IInitInfo } from '../config/interface';
import {threadItemListToSingleChatMessage} from './threadItemToLog';
import { IThreadItem } from '../config/schema';

const generateScaffoldingKeywords = async (basicInfo: IInitInfo ,questionInput: string, thread: IThreadItem[], granularity?: number) => {

  let granularity_instructions;
  switch (granularity) {
    case 1:
      granularity_instructions = 'keywords'
    case 2:
      granularity_instructions = 'phrases of around 3~5 words'
  }
  const threadLogTemplate = threadItemListToSingleChatMessage(thread)
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(
    `
    You are a helpful counseler aiding a user in reflecting on their personal narrative, who is trying to answer some reflective questions.
    Answering on reflexive questions is indeed cognitively challenging, and you should assist the user by providing some scaffolding {granularity_instructions} "in Korean", based on the user's context.
    The context of the user will be provide as twofold. 
    First is the narrative of the user, and second is the previous log of question and answering. 
    This is the narrative of the user: {narrative}
  ` + (thread.length? `This is the log: "${threadLogTemplate}"`: "")
  )
  const humanMessage = HumanMessagePromptTemplate.fromTemplate('You should 10 different plausible {granularity_instructions} which might act as a scaffolding and hint that might be related to answering the question: {question} "in Korean"')

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const answerSetSchema = z.object({
    granularItemSet: z.array(z.object({
      item: z.string().describe(""),
      rationale: z.string().describe("")
    }))
  })

  const structuredLlm = chatModel.withStructuredOutput(answerSetSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)
  const result = await chain.invoke({narrative: basicInfo.init_nar, question: questionInput, granularity_instructions: granularity_instructions})
  return result.granularItemSet;
}

export default generateScaffoldingKeywords;