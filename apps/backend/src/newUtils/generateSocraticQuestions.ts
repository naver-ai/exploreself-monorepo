import { IInitInfo } from "../config/interface";
import { Response } from 'express' 
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { z } from "zod";
import { chatModel } from "../config/config";
import { IThreadItem } from "../config/schema";


const generateSocraticQuestions = async (init_info: IInitInfo, history: IThreadItem[], selected_theme: string) => {

  const systemTemplate = `
  You are an helpful assistant who provides non-burdening yet meaningful Socratic questioning to the user, for one to understand better about one's personal narrative.
  [TASK]
  Provide meaningful Socratic questioning to the user "IN KOREAN", for one to understand better about one's personal narrative, relating to the theme that the user selects. 
  Here's the user's narrative: {init_narrative}.
  "${history.length?`
  Also, there is already a set of text that the user has written about one's situation.
  Based on the context of the writing, provide the at the moment most helpful Socratic question in text. 
  "Here's the current context of user's writing: {current_context}"
  `:""}"
  Following is the theme within the context that the user would like to get Socratic Questioning about: 
  ` // TODO: design prompt
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = `{selection}` // TODO: design prompt
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const questionSchema = z.object({
    questions: z.array(z.string())
  })
  
  const structuredLlm = chatModel.withStructuredOutput(questionSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)

  const result = await chain.invoke({init_narrative: init_info.init_nar, current_context: history.join(', '), selection: selected_theme})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

export {generateSocraticQuestions} ;