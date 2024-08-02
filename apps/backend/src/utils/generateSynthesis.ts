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
  You task is to aggregate/synthesize the user's q&a history (focused on user's response) within the self-help session the into a debriefing report in a 3rd person perspective. For example, if the person's name is Alice, it could be written as, “Alice felt … “
  It is just like a counseller writing a detailed debriefing report from the user's session. Since it's an aggregation of the user's session with user's inputs, directly adopt the user's expression and language. 
  However, you don't have to explicitly mention the asked question into the synthesis, like—-the question A was asked, and the user answered A'. 

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty, and the client's background.
  <previous_q&a_log/>: Log of previous self-help sessions
  <user_name/>: The user's name (to be used in writing in 3rd-person perspective).

  [Note about Output]
  Do not augment nor shorten the length of the output unnecessarily. 
  The goal is to aggregate the user's scattered input into a smooth holistic writing, directly adopting user's expressions, facilitating user's own self-reflection by reading through it. 
  If the goal is well achieved, the length doesn't matter, whether short or long. Note that the output should be “In Korean”, and should use Korean honorifics.
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
    synthesis: z.string().describe('Synthesis of the socratic question and answering of the user in Korean')
  }) 

  const structuredLlm = chatModel.withStructuredOutput(keywordsSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(user.initialNarrative)

  const prev_log = await synthesizePrevThreads(user._id)
  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, user_name: user_name})

  return (result as any).synthesis

}

export default generateSynthesis;