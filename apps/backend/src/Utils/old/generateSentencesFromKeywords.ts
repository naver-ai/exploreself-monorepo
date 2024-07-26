import { IInitInfo } from "../../config/interface";
import { chatModel } from "../../config/config";
import { AIMessagePromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"

import z from "zod"
import { IThreadItem } from "../../config/schema";
import {threadItemListToChatMessageList} from "./threadItemToLog";

const generateSentencesFromKeywords = async (basicInfo: IInitInfo, thread: IThreadItem[], question: string, selected_keywords: string[]) => {
  const systemMessageTemplate = `
  You are a helpful counseler aiding a user in reflecting on their personal narrative.
  This is the narrative of the user: {narrative}
  When the user feels burden to answer some questions, the user will answer in keywords. 
  Based on those keywords, you should provide 5 plausible answers for the question "in Korean". 
`;
  const AIMessageTemplate = `Counseler: {question}` // new question 

  const humanMessageTemplate = `
  It's cognitively difficult to think about it.  
  Here are the keywords that I think are relevant to responding the question: 
  {keywords}
  Based on these keywords, generate 5 plausible answers for the question. 
  `;

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemMessageTemplate)
  const threadLogMessage = threadItemListToChatMessageList(thread)
  const AIMessage = AIMessagePromptTemplate.fromTemplate(AIMessageTemplate)
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanMessageTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    threadLogMessage,
    AIMessage,
    humanMessage
  ].flat())

  const responseSchema = z.object({
    plausible_answers: z.array(z.string().describe('Plausible answer'))
  })

  const structuredLlm = chatModel.withStructuredOutput(responseSchema)

  const narrative = basicInfo.init_nar;
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const result = await chain.invoke({narrative: narrative, question: question, keywords: selected_keywords.join(', ')})

  return result;
}

export default generateSentencesFromKeywords;