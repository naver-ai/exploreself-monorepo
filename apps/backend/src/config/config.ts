import { ChatOpenAI } from '@langchain/openai';
import { OpenAI } from '@langchain/openai';

const chatModel = new ChatOpenAI({
  model: "gpt-4o"
});

const llmModel = new OpenAI({
  model: "gpt-4o"
})

const uid = '668bcb49eea1742b895f0fe8'

export {chatModel, llmModel, uid}