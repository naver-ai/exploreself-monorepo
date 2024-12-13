import {ChatPromptTemplate, HumanMessagePromptTemplate} from "@langchain/core/prompts"
import {SystemMessage} from "@langchain/core/messages"
import {z} from "zod";
import { chatModel } from '../config/config';
import nunjucks from 'nunjucks'
import { User, IThreadORM } from '../config/schema';
import { IUserBase } from '@core';
import {summarizePrevThreads, summarizeProfilicInfo} from './summary'
import mongoose from 'mongoose';

const generateThemes = async (uid: mongoose.Types.ObjectId, prev_themes: Array<string> = [], opt: number=1) => {

  const userData = await User.findById(uid).populate({path: 'threads'}) as IUserBase & {threads: IThreadORM[]}
  const themeList = userData.threads?.map(iteme => iteme.theme)
  const pinnedThemes = userData.pinnedThemes
  const language = userData.isKorean ? "in KOREAN": "in English"
  
  const system_message = nunjucks.renderString(`
  [Role] You are a therapeutic assistant designed to foster deep self-reflection and promote personal growth in clients. Your approach is empathetic, client-centered, and rooted in the principles of therapeutic inquiry. 

  [Task] 
  Your primary task is to identify new themes/items "${language}" for the client to explore/navigate, based on their personal narrative of previous responses. 
  These themes should serve as potential topics for follow-up questions and further reflection. 
  Ensure that these new themes align closely with the client's language, expressions, and the emotional tone of their narrative. 

  [Caution]
  When the client expresses negative or harmful self-perceptions, your role is to generate themes that encourage exploration of these statements "without altering the client’s original language". 
  But instead of reframing the expression, focus on prompting the client to delve into the underlying thoughts and feelings. 
  When appropriate, introduce phrase that prompt the client to reflect on why they used certain expressions or what those expressions mean to them.
  For example, when someone says 'I'm worthless', you SHOULDN'T elicit theme such as 'you being worthless'. Rather, it might be something like 'why you express you're worthless', 'what do you mean by ~'. 

  Avoid imposing interpretations that might stray from the client’s own words or expressed experiences. 
  It is crucial to remain in sync with the client’s language and expressions. 
  Use the client’s terminology when proposing new themes, ensuring that your suggestions resonate with their personal narrative. 
  When appropriate, introduce metaphoric expressions or nuanced language that might provide additional therapeutic value, but always anchor these in the client’s original phrasing and emotional context.


  [Input type and format]
  <initial_information/>: Client’s initial brief introductory of difficulty narrative, and the client’s background.
  {% if threadLength > 0 %}
    <previous_session_log>: Logs of sessions before the current session. “DO NOT” overlap with the previously selected themes.
  {% endif %}
  {% if pinnedLength > 0 %}
    <already_pinned_themes>: The themes that the user has already selected. “DO NOT” overlap with the previously selected themes.
  {% endif %}

    [Output]
    Produce a list of ${opt} themes based on the provided input. If no additional themes can be reasonably elicited, return an empty themes array instead of returning overlapping themes. 
    Ensure that new themes "DO NOT" overlap with previously selected ones, focusing instead on unique aspects of the client’s ongoing narrative. 
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
      main_theme: z.string().describe(`Each theme from the user's initial narrative and previous log. (${language}). Align closely with the user's language, expressions.`),
      expressions: z.array(z.string()).describe(`An array of diverse different expressions of the main_theme (${language}). When appropriate, introduce metaphoric expressions or nuanced language that might provide additional therapeutic value, but always anchor these in the client’s original phrasing and emotional context.`),
      quote: z.string().describe("Most relevant part of the user's log to the theme")
    }))
  })

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const structuredLlm = chatModel.withStructuredOutput(edgeSchema);

  const chain = finalPromptTemplate.pipe(structuredLlm);
  const init_info = summarizeProfilicInfo(userData.initialNarrative)
  const prev_session_log = await summarizePrevThreads(uid)

  const result = await chain.invoke({init_info: init_info, prev_log: prev_session_log, pinned_themes: themeList.concat(pinnedThemes).concat(prev_themes).join(', ')});

  return (result as any).themes;
} 

export default generateThemes;