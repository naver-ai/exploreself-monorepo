import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { z } from "zod";
import { chatModel } from "../config/config";
import { User, ThreadItem } from "../config/schema";
import nunjucks from 'nunjucks'
import synthesizePrevThreads from './synthesizeThread'
import synthesizeProfilicInfo from "./synthesizeProfilicInfo";
import mongoose from 'mongoose';


const generateQuestions = async (uid: mongoose.Types.ObjectId, tid: string) => {

  const userData = await User.findById(uid);
  const threadData = await ThreadItem.findById(tid);

  const threadLength = userData.threadRef.length;

  const systemTemplate = nunjucks.renderString(`
  [Role]
  You are a therapeutic assistant specializing in generating socratic questions to facilitate self-reflection and personal growth in clients. 
  Per each session within the system, the client brings up a Theme in one's narrative that one would like to navigate about.
  
  [Task]
  Given a client's personal narrative, your task is to generate list of 5 sequential socratic questions and intention of the question in Korean. 

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty, and the client's background.
  {{% if !threadLength %}}
    <previous_session_log>: Logs of sessions before the current session.
  {{% endif %}}
  <theme_of_session/>: Theme of the current session. 
  `, { threadLength: threadLength })
   // TODO: design prompt
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = nunjucks.renderString(`
  <initial_information/>: {init_info}
  {{% if !threadLength %}}
    <previous_session_log>: {prev_session_log}
  {{% endif %}}
  <theme_of_session/>: {theme}
  `, { threadLength: threadLength }) 

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const questionSchema = z.object({
    questions: z.array(z.object({
      question: z.string().describe('Socratic question to be provided to the user.'),
      intention: z.string().describe('Therapeutic intention of asking the question to the client.')
    }))
  })
  
  const structuredLlm = chatModel.withStructuredOutput(questionSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(userData.initial_narrative, userData.value_set, userData.background)
  const prev_session_log = await synthesizePrevThreads(uid)

  const result = await chain.invoke({init_info: init_info, prev_session_log: prev_session_log, theme: threadData.theme})

  return result.questions;
}

export default generateQuestions;