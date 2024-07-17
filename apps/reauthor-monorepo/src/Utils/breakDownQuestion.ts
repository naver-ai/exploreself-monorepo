import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { chatModel } from "../config"
import { z } from "zod";
import { useSelector } from "react-redux";
import { IRootState } from "../Redux/store";
import { IUser } from "apps/utils/schemaInterface";
import { IUserState } from "../Redux/reducers/userSlice";

const breakDownQuestion = async (userInfo: IUserState, original_question: string) => {
  //TODO: Fill in 
  // const userInfo = useSelector((state: IRootState) => state.userInfo)
  console.log("Break down question")
  const systemTemplate = `
  You are an helpful assistant that helps the counseler. 
  The client sometimes finds cognitively difficult to answer such question, so the counseler would like you to assist them to provide some easier question sticking to the original question. 
  Following is the conversation log: 
  - Client's initial narrative: {initial_narrative}
  = Client's value set in importance order: {value_set}
  - Counseler: {original_question}
  ` 
  // TODO: Few-shot
  // TODO: Add theme in prompt
  const humanTemplate = `
  Based on the log and the original question that the counseler asked the client, provide a list of 5 alternative questions, which are either an easier version of this question, or a break down question of this? 
  `
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const altQuestionSchema = z.object({
    questions: z.array(z.string().describe('alternative question'))
  })

  const structuredLlm = chatModel.withStructuredOutput(altQuestionSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)

  const result = await chain.invoke({initial_narrative: userInfo.initial_narrative, value_set: userInfo.value_set.join(' > '), original_question: original_question})

  return result.questions;
}

export default breakDownQuestion;