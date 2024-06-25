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