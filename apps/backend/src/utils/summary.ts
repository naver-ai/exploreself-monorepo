import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod"
import { chatModel } from '../config/config';
import { IAgendaORM, IUserORM } from '../config/schema';

import mongoose from "mongoose"
import { ThreadItem, User } from "../config/schema"
import nunjucks from 'nunjucks'
import { IMappedSummarySentence } from '@core';


export const summarizeProfilicInfo = (init_nar: string) => {

    return `
    The client describes one's narrative of difficulty as: "${init_nar}".
    `
  }

export async function generateTitleFromNarrative(user: IUserORM, narrative: string) {
  const user_name = user.name
  const isKorean = user.isKorean

  const systemTemplae = `
  [Context]
  The user has inserted their own story. 

  [Task]
  Provide a brief title text from the story.

  [Output Note]
  ${isKorean? "- The title should be in Korean.":""}
  - Refer to the user by name, in the 3rd person.
  - Keep it concise and grounded in the user’s actual input.
  `

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplae)

  const humanTemplate = `
  <story/>: {story}
  <user_name/>: {user_name}
  `

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const summarySchema = z.object({
    title: z.string().min(1).describe('A result title derived from the user\'s story.')
  })

  const structuredLlm = chatModel.withStructuredOutput(summarySchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  
  const result = await chain.invoke({story: narrative, user_name: user_name})

  return result.title
}

export async function summarizeThread(tid: string, option='default') {
  /*
  
  */
  const threadItem = await ThreadItem.findById(tid).populate('questions')
  
  const summary = nunjucks.renderString(`
  Theme: {{ theme }}\n
  {% if questions.length > 0 %}
    {% for set in questions %}
      {% if set.selected %}
        Q: {{ set.question.content }}\n
        {% if option == "keyword" and set.keywords %}
          Provided Keywords: {{ set.keywords.join(', ')}}\n
        {% elif option == "comment" and set.aiGuides %}
          Previously provided comments: {{ set.aiGuides.join('| ')}}\n
        {% endif %}
        A: {{ set.response }}\n
      {% endif %}
    {% endfor %}
  {% else %}
    The session doesn't have log yet.\n
  {% endif %}
  `,{theme: threadItem.theme, questions: threadItem.questions, option: option})

  return summary
}

async function summarizeThreadWithQid (tid: string, option='default') {

  const threadItem = await ThreadItem.findById(tid).populate('questions')
  
  const summary = nunjucks.renderString(`
  Theme: {{ theme }}\n
  {% if questions.length > 0 %}
    {% for set in questions %}
      {% if set.selected %}
        [QID: {{ set._id }}]: {{ set.question.content }}\n
        {% if option == "keyword" and set.keywords %}
          Provided Keywords: {{ set.keywords.join(', ')}}\n
        {% elif option == "comment" and set.aiGuides %}
          Previously provided comments: {{ set.aiGuides.join('| ')}}\n
        {% endif %}
        A: {{ set.response }}\n
      {% endif %}
      {% if not set.selected %}
        {% if option == "question" %}
          [Unselected question] set.question.content
        {% endif %}
      {% endif %}
    {% endfor %}
  {% else %}
    The session doesn't have log yet.\n
  {% endif %}
  `,{theme: threadItem.theme, questions: threadItem.questions, option: option})

  return summary
}

export async function summarizePrevThreads (agenda: IAgendaORM, option: string='default') {
  if (agenda.threads.length) {
    const summaries = await Promise.all(agenda.threads.map(async (ref) => {
      if(option=='qid'){
        return summarizeThreadWithQid(ref.toString(), option)
      }
      return summarizeThread(ref.toString(), option);
    }));
    
    return summaries.join();
  } else {
    return ''
  }
}


export async function generateSummary (user: IUserORM, agenda: IAgendaORM, opt: number=1) {
  const user_name = user.name
  const isKorean = user.isKorean

  const systemTemplae = `
  [Context]
  The user is participating in a self-help session through an LLM-driven system, responding to Socratic questions on a selected theme.

  [Role]
  You are a therapeutic assistant helping the user reflect on their session and progress.

  [Task]
  Summarize the user’s experiences and insights from their Q&A log into a coherent and concise narrative. Focus on the essence of their reflections without overemphasizing any one aspect.

  [Guidelines]
  - Capture the key points and overall sentiment without unnecessary detail.
  - Use the user’s own language and expressions where appropriate.
  - Keep the summary realistic, proportional to the content of the user’s log, and based on evidence.
  - Feel free to draw on the following as needed:
    - Major themes or emotions
    - Notable progress or changes in perspective
    - Encouragement to continue reflecting and growing
    - Recognition of the user’s strengths and resources

  [Output Note]
  ${isKorean? "- The summary should be in Korean and use honorifics.":""}
  - Refer to the user by name, in the 3rd person.
  - Keep it concise and grounded in the user’s actual input.
  `

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplae)

  const humanTemplate = `
  <initial_information/>: {init_info}
  <previous_q&a_log/>: {prev_log}
  <user_name/>: {user_name}
  `

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const summarySchema = z.object({
    summary: z.string().describe('A cohesive narrative that ties together the user’s experiences, reflections, and insights into a coherent story that help user gain deeper insights into their experiences, recognize their progress, and feel empowered to continue their journey of personal growth')
  })

  const structuredLlm = chatModel.withStructuredOutput(summarySchema)
  const chain = finalPromptTemplate.pipe(structuredLlm)
  const init_info = summarizeProfilicInfo(agenda.initialNarrative)

  const prev_log = await summarizePrevThreads(agenda)

  const result = await chain.invoke({init_info: init_info, prev_log: prev_log, user_name: user_name})

  return result.summary

}


export async function mapSummaryToQIDs(agenda: IAgendaORM, summary: string): Promise<Array<IMappedSummarySentence>>{
    const systemTemplate = `
    [Context]
    The user has completed a self-help session and a narrative summary has been generated based on their Q&A log. Each Q&A set in the log has a unique identifier (QID).
  
    [Role]
    You are a therapeutic assistant facilitating the user's self-reflection and therapeutic growth.
  
    [Task]
    For each sentence (or set of sentences) in the provided summary, map it to the relevant QID(s) from the Q&A log.
  
    [Goal]
    Ensure that each part of the summary can be linked to the corresponding Q&A interaction for reference.
  
    [Input type and format]
    <summary/>: The narrative summary generated in the previous step.
    <previous_q&a_log/>: Log of previous self-help sessions with QIDs.
  
    [Output Format]
    - Each sentence (or set of sentences) from the summary followed by the mapped QID(s).
    `;
  
    const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  
    const humanTemplate = `
    <summary/>: {summary}
    <previous_q&a_log/>: {prev_log}
    `;
  
    const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate);
  
    const finalPromptTemplate = ChatPromptTemplate.fromMessages([
      systemMessage,
      humanMessage
    ]);
  
    const mappingSchema = z.object({
      mappings: z.array(z.object({
        sentence: z.string().describe('A sentence or set of sentences from the summary'),
        qids: z.array(z.string()).describe('List of QID(s) that the sentence maps to')
      })).describe('List of sentences with their corresponding QID(s)')
    });
  
    const structuredLlm = chatModel.withStructuredOutput(mappingSchema);
    const chain = finalPromptTemplate.pipe(structuredLlm);
  
    const prev_log = await summarizePrevThreads(agenda, 'qid');
  
    const result = await chain.invoke({ summary, prev_log: prev_log });
  
    return (result as any).mappings;
  };