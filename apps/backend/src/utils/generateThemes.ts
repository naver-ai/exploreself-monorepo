import { ChatOpenAI } from '@langchain/openai';
import {ChatPromptTemplate, HumanMessagePromptTemplate} from "@langchain/core/prompts"
import {SystemMessage} from "@langchain/core/messages"
import {z} from "zod";
import { chatModel } from '../config/config';
import nunjucks from 'nunjucks'
import { User, ThreadItem, IThreadORM } from '../config/schema';
import { IUserBase } from '@core';
import { synthesizeProfilicInfo } from './synthesizeProfilicInfo';
import {synthesizePrevThreads} from './synthesizeThread'
import mongoose from 'mongoose';

const generateThemes = async (uid: mongoose.Types.ObjectId, additional_instructions='') => {

  const userData = await User.findById(uid).populate({path: 'threads'}) as IUserBase & {threads: IThreadORM[]}
  const themeList = userData.threads?.map(iteme => iteme.theme)
  const pinnedThemes = userData.pinnedThemes
  
  const system_message =  nunjucks.renderString(`
  [Role] You are a therapeutic assistant specializing in generating socratic questions to facilitate self-reflection and personal growth in clients. 
  Per each session within the system, the client brings up a Theme in one's narrative that one would like to navigate about.
  In each session, the user comes up with a resonse to a set of questions relevant to the theme.  

  [Task] 
  Your specific task is to identify new themes that the client can navigate on. 
  For each main_theme, also provide the referred part/quote of user input of the previous session "in Korean". 
  Try not do 'inference' in generating cards, and go ahead by assuming, but stick to the user's expression. Being synced with user's language/expression is important. 
  For each elicited main_theme (sticking to user's expression), come up with diverse different expressions of the main_theme. It could be altered in diverse ways expression-wise.  
  (Only if there is a good metaphoric expression, or in a therapeutically meaningful way), you can also feel free to fetch some metaphoric expressions, too

  [Input type and format]
  <initial_information/>: Client's initial brief introductory of difficulty narrative, and the client's background.
  {% if threadLength > 0 %}
    <previous_session_log>: Logs of sessions before the current session. Try not to overlap with the previously selected themes.
  {% endif %}
  {% if pinnedLength > 0 %}
    <already_pinned_themes>: The themes that the user has already selected to explore soon. Try not to overlap with the previously selected themes.
  {% endif %}

  `,{threadLength: themeList.length, pinnedLength: pinnedThemes.length})

  const systemMessage = new SystemMessage(system_message);

  const humanTemplate = nunjucks.renderString(`
  <initial_information> : {init_info}\n
  {% if threadLength > 0 %}
    <previous_session_log>: {prev_log}
  {% endif %}
  {% if pinnedLength > 0 %}
    <already_pinned_themes>: {pinned_themes}
  {% endif %}
  `, {threadLength: themeList.length, pinnedLength: pinnedThemes.length})


  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)


  const edgeSchema = z.object({
    themes: z.array(z.object({
      main_theme: z.string().describe("Each theme from the user's initial narrative and previous log. (in Korean). This main theme should directly borrow expression/language of the user."),
      expressions: z.array(z.string()).describe("An array of diverse different expressions of the main_theme (in Korean)."),
      quote: z.string().describe("Most relevant part of the user's narrative to the theme")
    }))
  })

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const structuredLlm = chatModel.withStructuredOutput(edgeSchema);

  const chain = finalPromptTemplate.pipe(structuredLlm);
  const init_info = synthesizeProfilicInfo(userData.initialNarrative)
  const prev_session_log = await synthesizePrevThreads(uid)

  const result = await chain.invoke({init_info: init_info, prev_log: prev_session_log, pinned_themes: pinnedThemes.join(', ')});

  return (result as any).themes;
} 

export default generateThemes;