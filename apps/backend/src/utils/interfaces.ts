export interface History {
  stacked_input?: string,
  user_background?: string,
  most_recent_input?: string;
  most_recent_question?: string,
}

export interface UserInput {
  type: string, // question, theme, input 
  text: string,
}

export interface ChatCompletionRequest {
  messages: Array<{ role: string, content: string }>;
  topP: number;
  topK: number;
  maxTokens: number;
  temperature: number;
  repeatPenalty: number;
  stopBefore: string[];
  includeAiFilters: boolean;
  seed: number;
}

export interface CompletionRequest {
  start: string;
  stopBefore: Array<string>;
  text: string;
  includeAiFilters: boolean;
}