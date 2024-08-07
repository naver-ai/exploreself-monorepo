export enum InteractionType {
  LLMElicitedTheme = 'LLMElicitedTheme', // O
  UserRequestExpression = 'UserRequestExpression', // O
  UserPinsTheme = 'UserPinsTheme', //  O 
  UserUnpinsTheme = 'UserUnpinsTheme', // O
  UserSelectsTheme = 'UserSelectsTheme', // O
  UserAddsTheme = 'UserAddsTheme', // O
  UserRequestsTheme = 'UserRequestsTheme',
  UserRequestsQuestion='UserRequestsQuestion', // O
  UserSelectsQuestion = 'UserSelectsQuestion', // O
  UpdateInResponse = 'UpdateInResponse', // O
  LLMGeneratedKeyword = 'LLMGeneratedKeyword', // O
  UserRequestsSynthesize = 'UserRequestsSynthesize',
}

export interface InteractionBase {
  interaction_type: InteractionType;
  metadata: Record<string, any> | {};
  interaction_data?: Record<string, any> | {};
}

export interface IAIGuide {
  content: string;
  rateGood?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQASetBase {
  question: {label?: string; content: string},
  keywords: string[],
  selected: boolean,
  response: string,
  aiGuides: IAIGuide[];
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IQASetWithIds extends IQASetBase {
  _id: string,
  tid: string
}

export interface IThreadBase {
  theme: string;
  synthesized?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IThreadWithQuestionIds extends IThreadBase {
  _id: string,
  questions: Array<string>,
  uid: string
}


export interface IThreadAllPopulated extends IThreadBase {
  _id: string,
  questions: Array<IQASetWithIds>,
  uid: string
}


export interface IUserBase {
  alias: string;
  passcode: string;
  name?: string | undefined;
  isKorean: boolean;
  initialNarrative: string | undefined;
  pinnedThemes: Array<string>
  synthesis: string[];
  createdAt: Date;
  updatedAt: Date;
  debriefing: string | undefined;
}

export interface IUserWithThreadIds extends IUserBase {
  _id: string,
  threads: Array<string>
}

export interface IUserAllPopulated extends IUserBase {
  _id: string,
  threads: Array<IThreadAllPopulated>
}

export interface ThemeWithExpressions {
  expressions: string[];
  main_theme: string;
  quote: string;
}

export interface IAdminUser {
  passcode: string;
}

export interface IAdminUserWithId extends IAdminUser {
  _id: string,
  passcode: string
}