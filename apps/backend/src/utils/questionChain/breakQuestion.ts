import { chatModel } from "../../config/config"
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"

const breakQuestions = (question: string) => {

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(`
  The user says this question is quite .

  `)

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(`
  
  `)

  const finalPromptTemplate = ChatPromptTemplate.fromTemplate(`

  `)



}

export {breakQuestions}