import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { z } from "zod";
import { chatModel } from "../config/config";
import { User, ThreadItem } from "../config/schema";
import nunjucks from 'nunjucks'
import {synthesizePrevThreads} from './synthesizeThread'
import { synthesizeProfilicInfo } from "./synthesizeProfilicInfo";
import mongoose from 'mongoose';


const generateQuestions = async (uid: mongoose.Types.ObjectId, tid: string, opt:number=1, prevQ: Array<string>=[]) => {

  const userData = await User.findById(uid);
  const threadData = await ThreadItem.findById(tid);

  const threadLength = userData.threads.length;
  const language = userData.isKorean ? "in KOREAN": "in English"

  const systemTemplate = nunjucks.renderString(`
  [Role]
  You are a therapeutic assistant specializing in generating socratic questions to facilitate self-reflection and personal growth in clients. 
  Per each session within the system, the client brings up a Theme in one's narrative that one would like to navigate about.
  
  [Task]
  Given a client's personal narrative and context, your task is to generate list of "just ${opt}" socratic questions and intention of the question ${language}. 
  Try at most to follow up with the user's previous response (if there is any). 

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty, and the client's background.
  <previous_session_log>: Logs of sessions before the current session. Don't overlap with the previously selected questions!
  <theme_of_session/>: Theme of the current session. 
  {% if prevQLen > 0 %}
    <existing_questions/>: The questions that are already provided to the users as options. Do not overlap with these existing questions. 
  {% endif %}
  `,{prevQLen: prevQ.length})

   // TODO: design prompt
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = nunjucks.renderString(`
  <initial_information/>: {init_info}
  <previous_session_log>: {prev_session_log}
  <theme_of_session/>: {theme}
  {% if prevQLen > 0 %}
    <existing_questions/>: {{ prevQ }}
  {% endif %}
  `,{prevQLen: prevQ.length, prevQ: prevQ.join(', ')})

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const questionSchema = z.object({
    questions: z.array(z.object({
      question: z.string().describe(`Socratic question to be provided to the user. (${language}). Use honorific ${language}`),
      intention: z.string().describe(`Therapeutic intention of asking the question to the client. (${language})`)
    }))
  })
  
  const structuredLlm = chatModel.withStructuredOutput(questionSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = synthesizeProfilicInfo(userData.initialNarrative)
  
  try {
    const prev_session_log = await synthesizePrevThreads(uid, "question")
    const result = await chain.invoke({init_info: init_info, prev_session_log: prev_session_log, theme: threadData.theme})
    return (result as any).questions;
  } catch (err){
    throw err;
  }
}

export default generateQuestions;