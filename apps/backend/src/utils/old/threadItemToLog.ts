import { IThreadORM } from "../../config/schema";
import { HumanMessagePromptTemplate, AIMessagePromptTemplate, } from '@langchain/core/prompts';


const threadItemToChatMessage = (threadItem: IThreadORM) => {
  //TODO fix new schema error
  const AI_message_template = "" //`Counsler: "${threadItem.question}"`
  const human_message_template = "" //`Client: "${threadItem.response}"`
  const AIMessage = AIMessagePromptTemplate.fromTemplate(AI_message_template)
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(human_message_template) 
  return [AIMessage, humanMessage];
}

const threadItemToChatTemplate = (threadItem: IThreadORM) => {
  const question = "" // threadItem.question;
  const response = "" // threadItem.response;
  const chatTemplate = `
  Counseler: "${question}"\n
  Client: "${response}"\n
  `
  return chatTemplate
}

const threadItemListToChatMessageList = (thread: IThreadORM[]) => { 
  return thread.map(threadItem => threadItemToChatMessage(threadItem)).flat();
}

const threadItemListToSingleChatMessage = (thread: IThreadORM[]) => {
  return thread.map(threadItem => threadItemToChatTemplate(threadItem)).join('')
}


export  {threadItemListToChatMessageList, threadItemListToSingleChatMessage};