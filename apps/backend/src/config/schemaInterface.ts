import mongoose, { Document, Schema } from 'mongoose';

interface IScaffolding extends Document {
  scaffolding: string;
  createdAt: Date;
}
interface IAnswer extends Document {
  question: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  scaffoldings: IScaffolding[];
  createdAt: Date;
}

interface IQuestion extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  plausibleAnswers: IAnswer[];
  userAnswer: IAnswer;
  selected: boolean;
  createdAt: Date;
}

interface IThread extends Document {
  user: mongoose.Types.ObjectId;
  theme: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdAt: Date;
}

interface ITheme extends Document {
  user: mongoose.Types.ObjectId;
  repContent: string;
  altContent: string[];
  description: string;
  threads: IThread[];
  createdAt: Date;
  saved: boolean;
  activated: boolean;
}

interface IHistoryItem extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  answer: mongoose.Types.ObjectId;
}

interface IUser extends Document {
  name: string;
  selfNarrative: string;
  background: string;
  themes: ITheme[];
  history: IHistoryItem[];
  createdAt: Date;
}

export {IHistoryItem}
