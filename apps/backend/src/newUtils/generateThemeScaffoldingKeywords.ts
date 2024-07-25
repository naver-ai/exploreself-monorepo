import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { IInitInfo } from '../config/interface';
import {threadItemListToSingleChatMessage} from './threadItemToLog';
import { IThreadItem } from '../config/schema';
import synthesizePrevInput from './synthesizePrevInput';

const generateThemeScaffoldingKeywords = async (uid: string ,theme: string) => {

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(
    `
    [Role]
    You are a helpful assistant that supports the user in the expressive writing about one's narrative of personal difficulty.
    
    [Task]
    The user have selected the theme to write about. Relating on these themes, provide a list of specific items (in keyword or short phrase) relating on the theme that the user can think about. 
    The purpose of the writing overall is to help ther user 'understand' by structurally writing about one's narrative. 

    [Input]
    <previous_input/>: This input is to provide context of the user's narrative, including user's narrative and session logs of the counseling session. 
    <selected_theme/>: The theme that the user selected to write about. 

    [Output]
    An array of object, including 1) string item (in keyword or short phrase) that the user can write about, in relation to the selected theme, and 2) rationale of why this item can be beneficial to think about, in understanding one's narrative.  
    All contents should be in Korean  
  `)

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(`
  <previous_input/>: {previous_input}
  <selected_theme/>: {theme}
  `)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const scaffoldingSetSchema = z.object({
    scaffoldingSet: z.array(z.object({
      item: z.string().describe("string item (in keyword or short phrase) that the user can write about, in relation to the selected theme"),
      rationale: z.string().describe("rationale of why this item can be beneficial to think about, in better understanding one's narrative")
    }))
  })

  const structuredLlm = chatModel.withStructuredOutput(scaffoldingSetSchema)

  const previous_input = await synthesizePrevInput(uid)

  const chain = finalPromptTemplate.pipe(structuredLlm)
  const result = await chain.invoke({previous_input: previous_input, theme: theme})
  return result.scaffoldingSet;
}

export default generateThemeScaffoldingKeywords;