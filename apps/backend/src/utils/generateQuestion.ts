import { ChatOpenAI } from '@langchain/openai';
import {ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate} from "@langchain/core/prompts"
import {SystemMessage} from "@langchain/core/messages"
import {z} from "zod";

const generateQuestions = async (mode, history, selection, additional_instructions='') => {
  // mode 0: within context
  // mode 1: 새로운 topic을 선택했을 때
  // TODO: mode setting 


  console.log("selected theme: ", selection)
  const most_recent_input = history.most_recent_input
  const stacked_input = history.stacked_input;

  const current_context = (stacked_input || '') + (most_recent_input || '')
  
  const model = new ChatOpenAI({
    model: "gpt-4"
  });
  const mode_prompt = mode==0 ? "within context prompt":"new topic prompt"
  
  const systemTemplate = `
  You are an helpful assistant who provides non-burdening yet meaningful Socratic questioning to the user, for one to understand better about one's personal narrative.
  There is already a set of text that the user has written about one's situation.
  Based on the context of the writing, provide the at the moment most helpful Socratic question in text. 
  Here's the current context of user's writing: {current_context}
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
  
  const structuredLlm = model.withStructuredOutput(questionSchema)

  const chain = finalPromptTemplate.pipe(structuredLlm)

  const result = await chain.invoke({current_context: current_context, selection: selection})

  return result.questions[0];
}

export default generateQuestions;