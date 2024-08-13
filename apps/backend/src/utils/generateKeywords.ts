import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { QASet } from '../config/schema';
import { IUserORM } from '../config/schema';
import { synthesizeProfilicInfo } from './synthesizeProfilicInfo';
import { synthesizePrevThreads } from './synthesizeThread';
import nunjucks from 'nunjucks'


const generateKeywords = async (user: IUserORM, qid: string, opt:number=1) => {
  const qData = await QASet.findById(qid)
  const question = qData.question.content
  const keywords = qData.keywords
  const language = user.isKorean ? "in KOREAN": "in English"

  const systemTemplae = nunjucks.renderString(`
  [Role]
  You are a therapeutic assistant specializing in supporting users to response to socratic questions, facilitating self-reflection and personal growth. 

  [Task]
  The user is given a socratic question to think about. However, it's not cogitively easy to answer those questions.
  Therefore, your task is to provide "just ${opt}" 'keywords' or 'short phrases' that might be useful for user to answer the given question.
  These keywords might act as 1) cognitive scaffolding 2) activate what might have been blind spot of the user 3) what might be relevant to users background and core values 4) and so on.
  Be aware that these keywords should be user friendly, and be ${language}, and try not to overlap with the keyword already provided in this question. 

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty, and the client's background.
  <previous_session_log>: Logs of sessions before the current session.
  <question/>: Question that the user is trying to think about now. 
  {% if keywords > 0 %}
    <existing_keywords/>: The keywords that are already provided to the users. Do not overlap with these existing keywords. 
  {% endif %}
  `,{keywords: keywords.length})

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplae)

  const humanTemplate = nunjucks.renderString(`
  <initial_information/>: {init_info}
  <previous_session_log>: {prev_log}
  <question/>: {question}
  {% if keywords > 0 %}
    <existing_keywords/>: {keywords}
  {% endif %}
  `,{keywords: keywords.length})

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const keywordsSchema = z.object({
    keywords: z.array(z.object({
      keyword: z.string().describe('Keyword'),
      rationale: z.string().describe('Rationale why this keyword might be useful in users answering the question.')
    }))
  }) 

  const structuredLlm = chatModel.withStructuredOutput(keywordsSchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(user.initialNarrative)

  const prev_log = await synthesizePrevThreads(user._id, "keyword")
  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, question: question, keywords: keywords.join(', ')})

  return (result as any).keywords

}

export default generateKeywords;