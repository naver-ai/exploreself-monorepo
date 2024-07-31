import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { chatModel } from "../config"
import { z } from "zod";

const generateQuestionFromContext = async (history_log: Array<string>, theme: string, qType: string) => {

  let questions;
  console.log("Q TYPE IS: ", qType)

  switch (qType){
    case 'followup':
      questions = await generateFollowupQuestion(history_log, theme)
      
    case 'withinTheme':
      questions = await generateThemedQuestion(history_log, theme)
      
    case 'newTheme':
      // TODO: invoke function that pops up new themes
      questions = await generateNewQuestion(history_log, theme)

    default:
      // TODO: Shoot error
      console.log("wrong qType")
      console.log("ERR")
  }
  return questions
}

//TODO: Custom each question generation function

const generateNewQuestion = async (history_log: Array<string>, theme: string, additional_instructions='') => {

  console.log("selected theme: ", theme)

  const systemTemplate = `
  You are an helpful assistant who provides non-burdening yet meaningful Socratic questioning to the user, for one to understand better about one's personal narrative.
  There is already a set of text that the user has written about one's situation.
  Based on the context of the writing, provide the at the moment most helpful Socratic question in text. 
  Here's the current context of user's writing: {current_context} // TODO: new theme과 context 어떻게 할지 결정
  Following is the theme within the context that the user would like to understand more about: 
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

  const result = await chain.invoke({current_context: history_log.join(), selection: theme})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

const generateFollowupQuestion = async (history_log: Array<string>, theme: string, additional_instructions='') => {

  console.log("selected theme: ", theme)

  const systemTemplate = `
  You are an helpful assistant who provides non-burdening yet meaningful Socratic questioning to the user, for one to understand better about one's personal narrative.
  There is already a set of text that the user has written about one's situation.
  Based on the context of the writing, provide the at the moment most helpful Socratic question in text. 
  Here's the current context of user's writing: {current_context} // TODO: new theme과 context 어떻게 할지 결정
  Following is the theme within the context that the user would like to understand more about: 
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

  const result = await chain.invoke({current_context: history_log.join(), selection: theme})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

const generateThemedQuestion = async (history_log: Array<string>, theme: string, additional_instructions='') => {

  console.log("selected theme: ", theme)

  const systemTemplate = `
  You are an helpful assistant who provides non-burdening yet meaningful Socratic questioning to the user, for one to understand better about one's personal narrative.
  There is already a set of text that the user has written about one's situation.
  Based on the context of the writing, provide the at the moment most helpful Socratic question in text. 
  Here's the current context of user's writing: {current_context} // TODO: new theme과 context 어떻게 할지 결정
  Following is the theme within the context that the user would like to understand more about: 
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

  const result = await chain.invoke({current_context: history_log.join(), selection: theme})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

export {generateQuestionFromContext}