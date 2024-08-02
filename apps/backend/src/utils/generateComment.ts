import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { QASet } from '../config/schema';
import { IUserORM } from '../config/schema';
import nunjucks from 'nunjucks'
import { synthesizeProfilicInfo } from './synthesizeProfilicInfo';
import { synthesizePrevThreads } from './synthesizeThread';


const generateComment = async (user: IUserORM, qid: string, response: string) => {
  const qData = await QASet.findById(qid)
  const question = qData.question.content
  const response_stat = response

  const systemTemplae = nunjucks.renderString(`
  [Role]
  You are a therapeutic assistant specializing in supporting users to work on personalized self-help workbook. 

  [Context]
  The user is working with a self-help workbook, that is personalized for the user's personal narrative of difficulty. 
  
  [Task]
  While the user is responding to the socratic question, your task is to provide useful comments based on the context of user's response.
  For example, if the user hasn't started answering the question or is in very early phase, you might a) provide tips on how to approach the question.
  You might also provide b) encouraging, affirmation, supportive feedback if you find that the , in a user-tailored manner. 
  It also could be the c) sub-question in answering the given question, or some d) insightful comment, or e) any other type of comment that might support user in responding to the question (name the label).

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty, and the client's background.
  <previous_session_log>: Previous Logs of the session before the current session.
  <question/>: Question that the user is trying to think about now. 
  {% if response_stat != '' and response_stat %}
    <current_response_status/>: The current response status of the question. You might refer to this context in providing comment.
  {% else %}
    <current_response_status/>: The user hasn't started responding. 
  {% endif %}

  [Output]
  For each category of comment a) b) c) d) e), generate 2 comments with the rationale of why this comment would be helpful at this moment to the user in responding to the question. 
  Then, select one comment that would be most appropriate and helpful for the client at the moment. 
  All should be in Korean.
  `,{response_stat: response_stat})

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplae)

  const humanTemplate = nunjucks.renderString(`
  <initial_information/>: {init_info}
  <previous_session_log>: {prev_log}
  <question/>: {question}
  {% if response_stat != '' and response_stat %}
    <current_response_status/>: {current_response_status}
  {% else %}
    <current_response_status/>: The user hasn't started responding. 
  {% endif %}
  `,{response_stat: response_stat})

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const commentSchema = z.object({
    candidates: z.array(z.object({
      category: z.string().describe('Category of the comment (in Korean)'),
      comment: z.string().describe('comment (in Korean)'),
      rationale: z.string().describe('rationale of why this comment would be appropriate and helpful for the client, considering the overall background and the response status (in Korean)')
    })),
    selected: z.object({
      category: z.string().describe('category of the selected comment (in Korean)'),
      comment: z.string().describe('selected commenin Koreant'),
      rationale: z.string().describe('rationale of the selected comment (in Korean)')
    }).describe('each category, comment, rationale of the selected comment (in Korean)')
  }) 

  const structuredLlm = chatModel.withStructuredOutput(commentSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(user.initialNarrative)

  const prev_log = await synthesizePrevThreads(user._id, "comment")
  
  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, question: question, current_response_status: response_stat})
  return result
}

export default generateComment;