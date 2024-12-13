import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { QASet } from '../config/schema';
import { IUserORM } from '../config/schema';
import { summarizePrevThreads, summarizeProfilicInfo } from './summary';


const generatePrompt = async (user: IUserORM, qid: string, keyword: string, curr_response: string, opt: number=3) => {
  const qaSet = await QASet.findById(qid)
  const question = qaSet.question.content
  const language = user.isKorean ? "in KOREAN": "in English"
  const systemTemplae = `
  [Role]
  You are a therapeutic assistant specializing in supporting users to response to socratic questions, facilitating self-reflection and personal growth. 

  [Context]
  The user is working on a LLM-driven self-help session by answering tailored socratic questions. However, it's not cogitively easy to answer those questions.
  Therefore, the user is given a set of relevant keywords to help with their cognitive load. 
  If the user selects one of the keyword, the system should provide some prompt that user can import in the textarea for response. 

  [Task]
  You task is to generate such prompts based on the keyword selected, and referring to the context of the previous user input log. 
  You should not give deterministic prompts, but rather open-ended, or prompts that can support user's self-reflection and therapeutic growth.  
  For example, if the user selects 'fear', the generated prompts might be such as 'When I felt fear was, ', 'I think feeling fear is understandable in such situation. Therefore, also in mine, '. Likewise, the prompt shouldn't be finsihed as a sentence. It should always be unfinished so that the user has space to fill in by self-reflection.
  This is just a very simple example, only to give a sense, so do not rely too much on this. 
  Along with the prompt, each provide a rationale of why this prompt can be helpful. It could be cognitively helpful in thinking about the question, it could be therapeutically meaningful/helpful, user might want to select that prompt considering the current context, etc ---there could be diverse rationales. 
  The prompt should be provided in a first-person perspective, since it can be imported to the textarea that the user is responding to, in one's own perspective, and it should be written "${language}". (The rationale can be English)
  
  [Checkpoints]
  - User should be attracted to importing the prompt in answering the given question
  - The prompt must be 'in scope' of the given question), 
  - Consider the context of the provided current response. "It should be natural to come right next in the current response."
  - These prompts shouldn't be so cognitively difficult to select. 



  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty.
  <previous_session_log>: Logs of sessions before the current session.
  <question/>: The socratic question that the user is trying to think about right now. 
  <selected_keyword/>: The keyword that user selected for prompts. 
  <current_response_status/>: The question's current response status of the user. 

  [Output]
  Provide "just ${opt}" best each different prompts.
  `

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplae)

  const humanTemplate = `
  <initial_information/>: {init_info}
  <previous_session_log>: {prev_log}
  <question/>: {question}
  <selected_keyword/>: {keyword}
  <current_response_status/>: {current_response}
  `

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const keywordsSchema = z.object({
    prompts: z.array(z.object({
      prompt: z.string().describe('Prompt that the user can import to the textarea of the response'),
      rationale: z.string().describe('Rationale of why this prompt might be helpful.')
    }))
  }) 

  const structuredLlm = chatModel.withStructuredOutput(keywordsSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = summarizeProfilicInfo(user.initialNarrative)

  const prev_log = await summarizePrevThreads(user._id)
  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, question: question, keyword: keyword, current_response: curr_response})

  return (result as any).prompts

}

export default generatePrompt;