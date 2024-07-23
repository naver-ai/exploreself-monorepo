import { IInitInfo } from "../config/interface";
import { Response } from 'express' 
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { z } from "zod";
import { chatModel } from "../config/config";
import { IThreadItem } from "../config/schema";


const generateOrientingQuestions = async (init_info: IInitInfo, history: IThreadItem[], selected_theme: string) => {

  const systemTemplate = `
  You are an helpful assistant who supports individual with difficulty to understand better about one's personal narrative.
  
  [TASK]
  When counselers ask questions to the client, there are commonly 2 types of intentions---a) understanding better of the client's situation (orienting questions), and b) provoking thoughts (influential questions).
  You task is to provide 'orienting circular questions' to the user, based on the narrative that the user provided. 
  For a bit more explanation, these orienting question has the intention of 'tell me more, in detail' in the counselers side. However, you are providing scaffolding questions for user to reveal more. 
  Be very straightforward. It should be not to hard to answer, but just simple questions to know a bit more about the user, related to the theme that the user provides in respect to the narrative.
  Provide a list of 5 orienting questions (yet non-congitively burdening) based on the information that the user provides. 

  [PROVIDED DATA]
  User will provide 1) one's brief [personal narrative], and 2) the [theme] that one would especially like to better understand about. 
  You should focus on the "theme", weight more on the "theme". 
  
  [Personal Narrative]
  Provide meaningful Orientinc Circular questioning to the user "IN KOREAN", for one to understand better about one's personal narrative, relating to the theme that the user selects. 
  Here's the user's narrative: {init_narrative}.
  "${history.length?`
  Also, there is already a set of text that the user has written about one's situation.
  Based on the context of the writing, provide the at the moment most helpful Socratic question in text. 
  "Here's the current context of user's writing: {current_context}"
  `:""}"
  [Theme]
  Following is the theme that the user selected: {selected_theme}


  [EXAMPLES]
  (Input)
  Personal Narrative: I think I'm suffering from my responsibilities, and my worriness of my future, instead of focusing on my present. I would like to enjoy my life more.
  Theme that user selected: worriness of my future
  (Output)
  ['What are the top 3 main things of your future you are worried about?', 'When was the most recent incident that you worried about your future?', ...]

  ` // TODO: design prompt
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = `{selected_theme}` // TODO: design prompt
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

  const result = await chain.invoke({init_narrative: init_info.init_nar, current_context: history.join(', '), selected_theme: selected_theme})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

export {generateOrientingQuestions} ;