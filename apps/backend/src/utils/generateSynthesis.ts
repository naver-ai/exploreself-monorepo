import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { QASet } from '../config/schema';
import { IUserORM } from '../config/schema';
import { synthesizeProfilicInfo } from './synthesizeProfilicInfo';
import { synthesizePrevThreads } from './synthesizeThread';


const generateSynthesis = async (user: IUserORM, opt: number=1) => {
  const user_name = user.name

  const systemTemplae = `
  [Context]
  The user has completed a self-help session through an LLM-driven system. 
  The system provided tailored Socratic questions based on the selected theme, and the user responded to these questions, repeating this Q&A process like a counseling session. 
  The user has just viewed the log of their Q&A interactions.
  
  [Role] 
  You are a therapeutic assistant that facilitates user's self-reflection and therapeutic growth. 

  [Task]
  Create a cohesive narrative that ties together the user’s experiences, reflections, and insights into a coherent story referring to the user log history (focused on the user's responses). 
  But avoid overwhelming repeating of the Q&A log since. 
  Instead, provide a concise summary that captures the essence and key points.

  [Tips for the List]
  - Major Themes and Emotions: List key themes and emotions that emerged during the session.
  - Growth and Progress: Identify and summarize any cognitive distortions or positive patterns, and note significant changes in the user's perspective or attitude.
  - Encouragement: Include items that encourage the user to continue reflecting and growing.
  - Strengths and Resources: List the strengths and resources the user has utilized or can utilize in dealing with their difficulties.
  - Positive Framing: Frame insights positively to motivate the user, even when addressing challenges.

  [Goal]
  Help users gain deeper insights into their experiences, recognize their progress, and feel empowered to continue their journey of personal growth. 
  Use the user's own expressions and language from the log where appropriate. 
  Keep the list clear and concise, avoiding repetitive details.

  [Input type and format]
  <initial_information/>: Client's brief introduction of their difficulty and background.
  <previous_q&a_log/>: Log of previous self-help sessions
  <user_name/>: The user's name (use in 3rd-person perspective).

  [Output Note]
  - The output should be in Korean and use Korean honorifics.
  - Use the user's name instead of "you."
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

  const synthesisSchema = z.object({
    synthesis: z.string().describe('A cohesive narrative that ties together the user’s experiences, reflections, and insights into a coherent story that help user gain deeper insights into their experiences, recognize their progress, and feel empowered to continue their journey of personal growth')
  })

  const structuredLlm = chatModel.withStructuredOutput(synthesisSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(user.initialNarrative)

  const prev_log = await synthesizePrevThreads(user._id)

  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, user_name: user_name})

  return (result as any).synthesis

}

export default generateSynthesis;