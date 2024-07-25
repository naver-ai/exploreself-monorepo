import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { chatModel } from "../config/config";
import { IInitInfo } from "../config/interface";

interface ScaffoldingQuestion {
  question: string;
  choices: string[];
}

const generateScaffoldingQuestions = async (init_info: IInitInfo, question: string): Promise<ScaffoldingQuestion[]> => {
  const systemTemplate = `
  - Role: You are a helpful assistant who provides multiple-choice scaffolding questions to help the user navigate their personal narrative of difficulty.
  - Task: Based on the user's background and the main Socratic question, generate a list of easier multiple-choice scaffolding questions that can help the user answer the main Socratic question.
  For example, those scaffolding questions would be Which of the following emotions did you most feel when~? --- such questions that is suitable for multiple choice questions. What, Who, When, etc. 
  
  Here's the user's background: {narrative}.
  Main Socratic question: {question}
  Provide a list of scaffolding questions in the format IN KOREAN: {{"question": "string", "choices": ["string"]}}
  `;
  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate);

  const humanTemplate = `{question}`; 
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate);

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ]);

  const questionSchema = z.array(z.object({
    question: z.string(),
    choices: z.array(z.string())
  }));

  const structuredLlm = chatModel.withStructuredOutput(questionSchema);

  const chain = finalPromptTemplate.pipe(structuredLlm);

  const result = await chain.invoke({ narrative: init_info.init_nar, question: question });

  return result as ScaffoldingQuestion[];
};

export { generateScaffoldingQuestions };
