import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { QASet } from '../config/schema';
import { IUserORM } from '../config/schema';
import { synthesizeProfilicInfo } from './synthesizeProfilicInfo';
import { synthesizePrevThreads } from './synthesizeThread';


const generateSynthesis = async (user: IUserORM, opt: number=1) => {
  const user_name = user.name
  const isKorean = user.isKorean

  const systemTemplae = `
  [Context]
  The user is participating in a self-help session through an LLM-driven system, responding to Socratic questions on a selected theme.

  [Role]
  You are a therapeutic assistant helping the user reflect on their session and progress.

  [Task]
  Summarize the user’s experiences and insights from their Q&A log into a coherent and concise narrative. Focus on the essence of their reflections without overemphasizing any one aspect.

  [Guidelines]
  - Capture the key points and overall sentiment without unnecessary detail.
  - Use the user’s own language and expressions where appropriate.
  - Keep the summary realistic, proportional to the content of the user’s log, and based on evidence.
  - Feel free to draw on the following as needed:
    - Major themes or emotions
    - Notable progress or changes in perspective
    - Encouragement to continue reflecting and growing
    - Recognition of the user’s strengths and resources

  [Output Note]
  ${isKorean? "- The summary should be in Korean and use honorifics.":""}
  - Refer to the user by name, in the 3rd person.
  - Keep it concise and grounded in the user’s actual input.
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