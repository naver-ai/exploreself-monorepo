import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import z from "zod";
import { chatModel } from '../config/config';
import { IUserORM } from '../config/schema';
import { synthesizePrevThreads } from './synthesizeThread';

const mapSynthesisToQIDs = async (user: IUserORM, synthesis: string) => {
  const systemTemplate = `
  [Context]
  The user has completed a self-help session and a narrative synthesis has been generated based on their Q&A log. Each Q&A set in the log has a unique identifier (QID).

  [Role]
  You are a therapeutic assistant facilitating the user's self-reflection and therapeutic growth.

  [Task]
  For each sentence (or set of sentences) in the provided synthesis, map it to the relevant QID(s) from the Q&A log.

  [Goal]
  Ensure that each part of the synthesis can be linked to the corresponding Q&A interaction for reference.

  [Input type and format]
  <synthesis/>: The narrative synthesis generated in the previous step.
  <previous_q&a_log/>: Log of previous self-help sessions with QIDs.

  [Output Format]
  - Each sentence (or set of sentences) from the synthesis followed by the mapped QID(s).
  `;

  const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate);

  const humanTemplate = `
  <synthesis/>: {synthesis}
  <previous_q&a_log/>: {prev_log}
  `;

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate);

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ]);

  const mappingSchema = z.object({
    mappings: z.array(z.object({
      sentence: z.string().describe('A sentence or set of sentences from the synthesis'),
      qids: z.array(z.string()).describe('List of QID(s) that the sentence maps to')
    })).describe('List of sentences with their corresponding QID(s)')
  });

  const structuredLlm = chatModel.withStructuredOutput(mappingSchema);
  const chain = finalPromptTemplate.pipe(structuredLlm);

  const prev_log = await synthesizePrevThreads(user._id, 'qid');

  const result = await chain.invoke({ synthesis: synthesis, prev_log: prev_log });

  return (result as any).mappings;
};

export default mapSynthesisToQIDs;
