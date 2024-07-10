import mongoose, { Document, Schema } from 'mongoose';

interface IAnswer extends Document {
  aContent: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IGranularItems extends Document {
  labelContent: string;
  uGenerated: boolean;
  selected: boolean
}

interface IQuestion extends Document {
  user: mongoose.Types.ObjectId;
  qContent: string;
  granularItems: IGranularItems[];
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
  content: string;
}

interface IUser extends Document {
  name: string;
  selfNarrative: string;
  background: string;
  themes: ITheme[];
  history: IHistoryItem[];
}

export {IUser, IHistoryItem}