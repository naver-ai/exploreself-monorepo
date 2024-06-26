const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChoiceSchema = new Schema({
  choiceId: String,
  choiceText: String,
  timestamp: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema({
  questionId: String,
  questionText: String,
  userAnswer: String,
  timestamp: { type: Date, default: Date.now }
});

const ThemeSchema = new Schema({
  themeId: String,
  name: String,
  questions: [QuestionSchema],
  choices: [ChoiceSchema]
});

const SessionSchema = new Schema({
  sessionId: String,
  themes: [ThemeSchema]
});

const UserSchema = new Schema({
  name: String,
  background: String,
  initialNarrative: String,
  sessions: [SessionSchema]
});