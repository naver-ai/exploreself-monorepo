import { Request, Response, NextFunction } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import {ChatPromptTemplate, PromptTemplate} from "@langchain/core/prompts"
import {AIMessage, HumanMessage, SystemMessage} from "@langchain/core/messages"
import {z} from "zod";

const generateThemes = async (req: Request, res: Response) => {
  const model = new ChatOpenAI({
    model: "gpt-4"
  });

  const systemMessage = new SystemMessage(`
  I am going to provide you with a personal narrative shared by a user. 
  Your task is to identify 10 themes that the user can explore further. 
  Please ensure that these themes are directly derived from the user's own words and expressions. 
  Do not assume the user's emotions or thoughts based on the situation described. 
  Instead, focus on using the exact language and phrases used by the user. 
  The themes should be framed in a way that would likely engage the user and highlight important aspects of their experience.
  Also, for each theme, also retrieve the most relevant part (It could be sentence(s), phrase(s) in the narrative, with each theme) 
  `);

  const humanMessage = new HumanMessage(`User's narrative: {user_narrative}`)

  const narrative = `
  Ever since middle school, I've always seen myself as someone who thrives in the shadows, away from the glaring spotlight of public attention. 
  I preferred to keep my head down, diligently working in quiet solitude, and my social interactions were always subtle, never the center of attention. 
  But recently, my usual tranquility at work was disrupted when I was unexpectedly chosen to lead a major project. 
  This wasn't just any project; it involved a division-wide presentation, thrusting me into the very spotlight I had always avoided. 
  The thought of standing in front of all those people, having to lead and direct, filled me with an intense dread that was completely new to me. 
  `

  const edges = z.object({
    themes: z.array(z.object({
      theme: z.string().describe("Each theme from the personal narrative shared by a user."),
      quote: z.string().describe("Most relevant part of the user's narrative, to the theme")
    }))
  })

  const finalPrompt = ChatPromptTemplate.fromMessages([
    systemMessage,
    narrative
  ])

  const structuredLlm = model.withStructuredOutput(edges);
  const chain = finalPrompt.pipe(structuredLlm)

  const result = await chain.invoke({user_narrative: narrative})
  // console.log("RESULT: ", result)

  res.json(result)

}

export default generateThemes;