import { IThreadItem } from "../config/schema";
import { HumanMessagePromptTemplate, AIMessagePromptTemplate, } from '@langchain/core/prompts';


const threadItemToChatMessage = (threadItem: IThreadItem) => {
  const AI_message_template = `Counsler: "${threadItem.question}"`
  const human_message_template =  `Client: "${threadItem.response}"`
  const AIMessage = AIMessagePromptTemplate.fromTemplate(AI_message_template)
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(human_message_template) 
  return [AIMessage, humanMessage];
}

const threadItemToChatTemplate = (threadItem: IThreadItem) => {
  const question = threadItem.question;
  const response = threadItem.response;
  const chatTemplate = `
  Counseler: "${question}"\n
  Client: "${response}"\n
  `
  return chatTemplate
}

const threadItemListToChatMessageList = (thread: IThreadItem[]) => { 
  return thread.map(threadItem => threadItemToChatMessage(threadItem)).flat();
}

const threadItemListToSingleChatMessage = (thread: IThreadItem[]) => {
  return thread.map(threadItem => threadItemToChatTemplate(threadItem)).join('')
}


export  {threadItemListToChatMessageList, threadItemListToSingleChatMessage};