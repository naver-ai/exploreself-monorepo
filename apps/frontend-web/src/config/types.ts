export interface ITypeAScaffoldingState {
  tried: boolean;
  unselected_keywords: string[];
  selected_keywords: string[];
  user_added_keywords: string[];
  selected_generated_sentence: string[];
}

export interface IScaffoldingData {
  typeA?: ITypeAScaffoldingState;
  // TODO: Type B and C, too
}

export interface IThreadItem {
  tid: string;
  theme: string;
  orientingInput?: string;
  question?: string;
  scaffoldingData?: IScaffoldingData;
  synthesized?: string;
  response?: string;
  history_information?: string;
}

export interface IUser {
  _id: string;
  name: string;
  initial_narrative: string;
  value_set: string[];
  background: string;
  thread: IThreadItem[];
  threadRef: string[];
  // history: IHistoryItem[]
  createdAt: Date;
  updatedAt?: Date;
}

export interface ValueItemType {
  id: number;
  value: string;
}
