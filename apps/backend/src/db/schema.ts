import mongoose from "mongoose";
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  question: {type: Schema.Types.ObjectId, ref: 'Question', required: true},
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  content: {type: String, default: Date.now},
  createdAt: {type: Date, default: Date.now}
})

const QuestionSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  content: {type: String, required: true},
  plausibleAnswers: [AnswerSchema],
  userAnswer: AnswerSchema,
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
  name: {type: String, required: true},
  description: {type: String},
  threads: [ThreadSchema],
  createdAt: {type: Date, default: Date.now}
});

const HistoryItemSchema =  new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  question: {type: Schema.Types.ObjectId, ref: 'Question'},
  answer: {type: Schema.Types.ObjectId, ref: 'Answer'}
})


const UserSchema = new Schema({
  name: String,
  selfNarrative: {type: String, required: true},
  background: {type: String, required: true},
  themes: [ThemeSchema],
  history: [HistoryItemSchema],
  createdAt: {type: Date, default: Date.now}
});

export {AnswerSchema, QuestionSchema, ThreadSchema, ThemeSchema, HistoryItemSchema, UserSchema}