import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { QASet } from '../config/schema';
import { IUserORM } from '../config/schema';
import { synthesizeProfilicInfo } from './synthesizeProfilicInfo';
import { synthesizePrevThreads } from './synthesizeThread';


const generateSynthesis = async (user: IUserORM) => {
  const user_name = user.name

  const systemTemplae = `
  [Context]
  The user is doing a self-help session through an LLM-driven system, where the system provides tailored socratic question for the user for the theme that user has selected, and the user replies to the question, and this q&a turn repeats (just like counseling). 
  
  [Role] 
  You are a therapeutic assistant that facilitates user's self-reflection and therapeutic growth. 

  [Task]
  Your task is to provide to provide comments as a therapeutic assistant, based on the user's q&a history (focused on user's response) within the self-help session. 
  These comments could be insights, interpretation, analysis, suggestion, etc. 
  However, do not conclude something, but rather a suggestion, such as--It might be worthy to consider, think, etc rather than You are, etc. 
  Also, try to directly adopt the user's expression and language. 

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty, and the client's background.
  <previous_q&a_log/>: Log of previous self-help sessions
  <user_name/>: The user's name (to be used in writing in 3rd-person perspective).

  [Note about Output]
  Note that the output should be “In Korean”, and should use Korean honorifics. Also use user's name, than 'you'. 
  `

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplae)

  const humanTemplate = `
  <initial_information/>: {init_info}
  <previous_q&a_log/>: {prev_log}
  <user_name/>: {user_name}
  `

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const keywordsSchema = z.object({
    comments: z.array(z.object({
      comment: z.string().describe('Comment to the user.'),
      reference: z.string().describe('Evidence of the user log, that supports the comment.')
    }))
  }) 

  const structuredLlm = chatModel.withStructuredOutput(keywordsSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(user.initialNarrative)

  const prev_log = await synthesizePrevThreads(user._id)

  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, user_name: user_name})

  return (result as any).comments

}

export default generateSynthesis;