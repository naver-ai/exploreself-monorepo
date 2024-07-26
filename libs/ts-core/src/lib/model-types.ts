interface ITypeAScaffolding {
  tried: boolean;
  unselected_keywords?: string[];
  selected_keywords: string[];
  user_added_keywords?: string[],
  selected_generated_sentence: string[];
  // ai_synthesize: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ITypeBQASet {
  question: string;
  selected: string[];
  unselected: string[];
}

interface ITypeBScaffolding{
  tried: boolean;
  qa_set: ITypeBQASet[];
  ai_synthesize: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITypeCPrompt {
  type: string;
  selected: boolean;
}

interface ITypeCPromptSet {
  tip: string;
  prompts: ITypeCPrompt[];
}

interface ITypeCScaffolding {
  tried: boolean;
  prompt_set: ITypeCPromptSet[];
  createdAt: Date;
  updatedAt: Date;
}

interface IScaffoldingData {
  typeA?: ITypeAScaffolding;
  typeB?: ITypeBScaffolding;
  typeC?: ITypeCScaffolding;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IThreadItem {
  theme: string;
  orientingInput?: string;
  question?: string;
  scaffoldingData?: IScaffoldingData;
  response?: string;
  history_information?: string;
  synthesized?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// interface IHistoryItem {
//   history_information: string;
//   threadItemRef?: mongoose.Types.ObjectId;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
export interface IUserBase {
  alias: string;
  passcode: string;
  name?: string | undefined;
  isKorean: boolean;
  initial_narrative: string | undefined
  value_set: string[];
  background: string | undefined
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithThreadIds extends IUserBase {
  _id: string,
  threadRef: Array<string>
}