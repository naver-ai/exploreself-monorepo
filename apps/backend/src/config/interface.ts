import mongoose from "mongoose";

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

export interface IAIFeedback extends Document {
  // TBD
}

export interface ITypeASelectedKeyword {
  content: string;
  ai_generated: boolean;
}
export interface ITypeAScaffolding extends Document {
  tried: boolean;
  unselected_keywords: string[];
  selected_keywords: string[];
  user_added_keywords: string[],
  selected_generated_sentence: string[];
  // ai_synthesize: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITypeBQASet {
  question: string;
  selected: string[];
  unselected: string[];
}

export interface ITypeBScaffolding extends Document {
  tried: boolean;
  qa_set: ITypeBQASet[];
  ai_synthesize: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITypeCPrompt {
  type: string;
  selected: boolean;
}

export interface ITypeCPromptSet {
  tip: string;
  prompts: ITypeCPrompt[];
}

export interface ITypeCScaffolding extends Document {
  tried: boolean;
  prompt_set: ITypeCPromptSet[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IScaffoldingData extends Document {
  typeA?: ITypeAScaffolding;
  typeB?: ITypeBScaffolding;
  typeC?: ITypeCScaffolding;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IThreadItem extends Document {
  uid?: mongoose.Types.ObjectId;
  theme: string;
  question: string;
  scaffoldingData: IScaffoldingData;
  response: string;
  history_information?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// interface IHistoryItem {
//   history_information: string;
//   threadItemRef?: mongoose.Types.ObjectId;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
export interface IUser extends Document {
  name: string;
  initial_narrative: string;
  value_set: string[];
  background: string;
  thread: IThreadItem[];
  threadRef: mongoose.Types.ObjectId[];
  // history: IHistoryItem[]
  createdAt: Date;
  updatedAt: Date;
}