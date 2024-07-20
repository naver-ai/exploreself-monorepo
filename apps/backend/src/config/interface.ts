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

export interface IInitInfo {
	init_nar: string;
	val_set: Array<string>;
	background: string;
}