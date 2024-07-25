import {ChatPromptTemplate, HumanMessagePromptTemplate} from "@langchain/core/prompts"
import {SystemMessage} from "@langchain/core/messages"
import {undefined, z} from "zod";
import { chatModel } from '../config/config';
import { IInitInfo } from '../config/interface';
import synthesizePrevInput from "./synthesizePrevInput";
import synthesizeSession from "./synthesizeSession";
import { ThreadItem, User } from "../config/schema";
import { readEnv } from "openai/core";


const generateThemesFromRecentResponse = async (uid: string, additional_instructions='') => {
  console.log("UID: ", uid)
  const system_message =  `
  [Role] You are a counselor assisting users in navigating and understanding their personal challenges and difficulties.

  [Description of the task]
  In this counseling session, you are using 'cards' to help the user navigate different themes and aspects of their narrative. Each session consists of a batch of interactions: 
  1) You present a set of 'cards' based on the client's previous inputs.
  2) The client selects one 'card' and provides a detailed description related to it.
  3) Based on the client's description, you pose a reflexive question to prompt deeper reflection.
  4) The client responds to the question.
  Your task is to generate new sets of 'cards' after each batch of interactions, referring to the entire narrative provided by the client and directly to the most recent batch of interactions.

  [Task] 
  Your specific task is to identify new 'cards' (themes/aspects) within the client's narrative, mainly arising from on the most recent session. 
  For each card(theme/aspects), also provide the referred part/quote of user input of the previous session "in Korean". 
  Try not do 'inference' in generating cards, and go ahead by assuming, but elicit cards from the response itself.

  [Input type and format]
  <previous_input/>: Client's narrative and background of the previous sessions. 
  <most_recent_session/>: Synthesis of the most recent session.

  [Description of the input]
  The 'card' (themes/aspects) set you will generate should mainly be tied with <most_recent_session/>. 
  <previous_input/> data is provided just to deliver a sense of context. 
  Stick to the expression that user has used. Being synced with user's language/expression is important. 

  [Output]
  Array of object, containing text string(keyword or short phrase), which is the new set of 'cards'. 
  `

  const systemMessage = new SystemMessage(system_message);

  const humanTemplate = `
  <previous_input/>: {previous_input}
  <most_recent_session/>: {recent_session}
  `

  const previous_input = await synthesizePrevInput(uid)
  const user = await User.findById(uid)
  const recent_thread = user.threadRef[user.threadRef.length-1]
  
  const most_recent_session = await synthesizeSession(recent_thread.toString(), uid)

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const edgeSchema =z.object(
    {
      "cards":z.array(z.object({
        theme: z.string().describe("Each card(theme/aspect) based on the user input of previous session"),
        quote: z.string().describe("Most relevant part with the card, among what user mentioned in the previous session")
      }))
    }
  )
  

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const structuredLlm = chatModel.withStructuredOutput(edgeSchema);

  const chain = finalPromptTemplate.pipe(structuredLlm);


  const result = await chain.invoke({previous_input: previous_input, recent_session: most_recent_session});
  return result.cards;
} 

export default generateThemesFromRecentResponse;