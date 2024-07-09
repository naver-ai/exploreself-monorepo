import mongoose from "mongoose";
const { Schema, Document, Model } = mongoose;

// interface IAnswer extends Document {
//   question: mongoose.Types.ObjectId;
//   user: mongoose.Types.ObjectId;
//   content: string;
//   createdAt: Date;
// }

// interface IQuestion extends Document {
//   user: mongoose.Types.ObjectId;
//   content: string;
//   plausibleAnswers: IAnswer[];
//   userAnswer: IAnswer;
//   selected: boolean;
//   createdAt: Date;
// }

// interface IThread extends Document {
//   user: mongoose.Types.ObjectId;
//   theme: mongoose.Types.ObjectId;
//   questions: IQuestion[];
//   createdAt: Date;
// }

// interface ITheme extends Document {
//   user: mongoose.Types.ObjectId;
//   repContent: string;
//   altContent?: string[];
//   description?: string;
//   threads?: IThread[];
//   createdAt?: Date;
//   saved: boolean;
//   activated: boolean;
// }

// interface IHistoryItem extends Document {
//   user: mongoose.Types.ObjectId;
//   question: mongoose.Types.ObjectId;
//   answer: mongoose.Types.ObjectId;
// }

// interface IUser extends Document {
//   name: string;
//   selfNarrative: string;
//   background: string;
//   themes: ITheme[];
//   history: IHistoryItem[];
//   createdAt: Date;
// }

const AnswerSchema = new Schema({
  question: {type: Schema.Types.ObjectId, ref: 'Question', required: true},
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  content: {type: String, required: true},
  createdAt: {type: Date, default: Date.now}
})


const QuestionSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  content: {type: String, required: true},
  plausibleAnswers: [AnswerSchema],
  userAnswer: AnswerSchema,
  selected: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const ThreadSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  theme: {type: Schema.Types.ObjectId, ref: 'Theme', required: true},
  questions: [QuestionSchema],
  createdAt: {type: Date, default: Date.now}
})

const ThemeSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  repContent: {type: String, required: true},
  altContent: {type: [String], default: []},
  description: {type: String, default:''},
  threads: {type: [ThreadSchema], default: []},
  createdAt: {type: Date, default: Date.now},
  saved: {type: Boolean, required: true},
  activated: {type: Boolean, required: true}
});

const HistoryItemSchema =  new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  question: {type: Schema.Types.ObjectId, ref: 'Question'},
  answer: {type: Schema.Types.ObjectId, ref: 'Answer'}
})


const UserSchema = new Schema({
  name: {type: String, required: true},
  selfNarrative: {type: String, required: true},
  background: {type: String, required: true},
  themes: {type: [ThemeSchema], default: []},
  history: {type: [HistoryItemSchema], default: []},
  createdAt: {type: Date, default: Date.now}
});

const Answer = mongoose.model('Answer', AnswerSchema)
const Question = mongoose.model('Question', QuestionSchema)
const Thread = mongoose.model('Thread', ThreadSchema)
const Theme = mongoose.model('Theme', ThemeSchema)
const HistoryItem = mongoose.model('HistoryItem', HistoryItemSchema)
const User = mongoose.model('User', UserSchema)


export {Answer, Question, Thread, Theme, HistoryItem, User}