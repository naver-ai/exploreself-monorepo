export enum InteractionType {

  UserStartsBrowserSession = "UserStartsBrowswerSession",
  UserEndsBrowserSession = "UserEndsBrowswerSession",

  LLMElicitedTheme = 'LLMElicitedTheme', // O
  UserRequestExpression = 'UserRequestExpression', // O
  UserPinsTheme = 'UserPinsTheme', //  O 
  UserUnpinsTheme = 'UserUnpinsTheme', // O
  UserSelectsTheme = 'UserSelectsTheme', // O
  UserAddsTheme = 'UserAddsTheme', // O
  UserRequestsTheme = 'UserRequestsTheme',
  UserRequestsQuestion='UserRequestsQuestion', // O
  UserSelectsQuestion = 'UserSelectsQuestion', // O
  UserFocusQuestion = "UserFocusQuestion",
  UserBlurQuestion = "UserBlurQuestion",
  UpdateInResponse = 'UpdateInResponse', // O
  ImportKeyword='ImportKeyword',
  LLMGeneratedKeyword = 'LLMGeneratedKeyword', // O

  UserToggleKeywords = "UserToggleKeywords",

  UserRequestsSummary = 'UserRequestsSummary',
  UserChangeSessionStatus = "UserChangeSessionStatus",
  UserTerminateExploration = "UserTerminateExploration",
  UserRevertTermination = "UserRevertTermination"
}

export interface InteractionBase {
  type: InteractionType;
  metadata?: Record<string, any> | {};
  data?: Record<string, any> | {};
  timestamp?: Date
}

export interface InteractionObj extends InteractionBase{
  _id: string
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
  selectedAt?: Date;
}


export interface IQASetWithIds extends IQASetBase {
  _id: string,
  tid: string
}

export interface IThreadBase {
  theme: string;
  summary?: string;
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

export enum SessionStatus{
  Exploring = "Exploring", 
  Reviewing = "Reviewing",
  Terminated = "Terminated"
}

export interface IUserBase {
  alias: string;
  passcode: string;
  name?: string | undefined;
  isKorean: boolean;
  initialNarrative: string | undefined;
  pinnedThemes: Array<string>
  summaries: string[];
  createdAt: Date;
  updatedAt: Date;
  debriefing: string | undefined;
  sessionStatus: SessionStatus;
  didTutorial: {themeBox: boolean, explore: boolean};
}

export interface IUserWithThreadIds extends IUserBase {
  _id: string,
  threads: Array<string>
}

export interface IUserAllPopulated extends IUserBase {
  _id: string,
  threads: Array<IThreadAllPopulated>
  browserSessions: Array<IUserBrowserSessionObj>
}

export interface ThemeWithExpressions {
  expressions: string[];
  main_theme: string;
  quote: string;
}

export interface IUserBrowserSessionBase {
  localTimezone: string
  startedTimestamp: number
  endedTimestamp?: number
}

export interface IUserBrowserSessionObj extends IUserBrowserSessionBase {
  _id: string
  interactionLogs: Array<InteractionBase>
}

export interface IDidTutorial {
  themeBox: boolean;
  explore: boolean;
};