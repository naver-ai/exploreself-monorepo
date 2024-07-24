import { IInitInfo } from "../config/interface";
import { Response } from 'express' 
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts"
import { z } from "zod";
import { chatModel } from "../config/config";
import { IThreadItem } from "../config/schema";
import synthesizePrevInput from "./synthesizePrevInput";


const generateSocraticQuestions = async (uid: string, selected_theme: string, orientingInput: string) => {
  
  const systemTemplate = `
  [Role]
  You are a therapeutic assistant specializing in generating reflexive questions to facilitate self-reflection and personal growth in clients. Reflexive questions are designed to encourage clients to think about their thoughts, feelings, behaviors, and relationships from new perspectives, promoting self-awareness and the discovery of new possibilities.
  
  [TASK]
  Given a client's personal narrative, your task is to generate reflexive questions that:
  - Facilitate Self-Reflection: Encourage the client to reflect on their experiences, thoughts, and feelings.
  - Promote Autonomy: Empower the client to consider new possibilities and solutions on their own.
  - Respect Client's Perspective: Maintain a non-directive, respectful tone that honors the client's autonomy and unique perspective.
  - Open New Perspectives: Help the client see their situation from different angles, potentially leading to new insights and ways of thinking. 

  [Input type and format]
  <user_narrative/>: User's narrative
  <theme/>: The overall theme to generate reflexive questions about
  <theme_description/>: How user described in detail about the theme. Refer to this description when generating reflexive question about the given theme.
  ` // TODO: design prompt

  const prev_input = await synthesizePrevInput(uid)


  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate)

  const humanTemplate = `
  <user_narrative/>: {prev_input}
  <theme/>: {theme}
  <theme_description>: {theme_description}
  ` // TODO: design prompt
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

  const result = await chain.invoke({prev_input: prev_input, theme: selected_theme, theme_description: orientingInput})

  // TODO: question에 save하는거, onChange 

  return result.questions;
}

export {generateSocraticQuestions} ;