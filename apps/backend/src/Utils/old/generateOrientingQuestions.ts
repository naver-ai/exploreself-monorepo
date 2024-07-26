import { IInitInfo } from "../../config/interface";
import { Response } from 'express' 
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { z } from "zod";
import { chatModel } from "../../config/config";
import { User, ThreadItem } from "../config/newSchema";


const generateOrientingQuestions = async (uid: string, tid: string) => {

  const userData = await User.findById(uid)
  const threadData = await ThreadItem.findById(tid)

  const systemTemplate = `
  [Role]
  You are a therapeutic assistant specializing in generating orienting socratic questions to facilitate self-reflection and personal growth in clients. 
  Orienting questions are designed to help oneself understand one's narrative, and orient the therapist to the client's situation and experiences.
  
  [TASK]
  Given a client's personal narrative, your task is to generate list of 5 orienting questions in Korean. 

  [Input type and format]
  <previous_session_log/>: Previous log of the session.
  <theme/>: The overall theme to generate questions about.
  ` // TODO: design prompt
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = `{selected_theme}` // TODO: design prompt
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const questionSchema = z.object({
    questions: z.array(z.object({
      question: z.string().describe(''),
      rationale: z.string().describe('')
    }))
  })
  
  const structuredLlm = chatModel.withStructuredOutput(questionSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)

  const result = await chain.invoke({init_narrative: init_info.init_nar, current_context: history.join(', '), selected_theme: selected_theme})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

export {generateOrientingQuestions} ;