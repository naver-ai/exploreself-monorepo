import mongoose from "mongoose";
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  aContent: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date}
})

const GranularItemSchema = new Schema({
  labelContent: {type: String, required: true},
  uGenerated: {type: Boolean, required: true},
  selected: {type: Boolean, default: false}
})

// TODO: 언어 (localized text)
const QuestionSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  qContent: {type: String, required: true},
  granularItems: [GranularItemSchema],
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
  historyType: {type: String},
  question: {type: Schema.Types.ObjectId, ref: 'Question'},
  content: {type: String}
})


const UserSchema = new Schema({
  name: {type: String, required: true},
  selfNarrative: {type: String, required: true},
  background: {type: String, required: true},
  themes: {type: [ThemeSchema], default: []},
  history: {type: [HistoryItemSchema], default: []},
});

AnswerSchema.set('timestamps', true);
QuestionSchema.set('timestamps', true)
ThreadSchema.set('timestamps', true)
ThemeSchema.set('timestamps', true)
HistoryItemSchema.set('timestamps', true)
GranularItemSchema.set('timestamps', true)


const Question = mongoose.model('Question', QuestionSchema)
const Theme = mongoose.model('Theme', ThemeSchema)
const HistoryItem = mongoose.model('HistoryItem', HistoryItemSchema)
const User = mongoose.model('User', UserSchema)


export {Question, HistoryItem, User, Theme}