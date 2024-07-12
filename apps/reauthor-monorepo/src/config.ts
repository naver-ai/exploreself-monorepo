import { ChatOpenAI } from '@langchain/openai';
import { OpenAI } from '@langchain/openai';

const chatModel = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY
});

const llmModel = new OpenAI({
  model: "gpt-4o",
  apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY
})

const dummyUid = '668bcb49eea1742b895f0fe8'

export {chatModel, llmModel, dummyUid}