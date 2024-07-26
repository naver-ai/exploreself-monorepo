import { IUserBase } from "@core";
import mongoose, {Schema, Document} from "mongoose";

export interface IAIGuide extends Document {
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQASet extends Document {
  question: {label?: string; content: string},
  keywords: string[],
  response: string,
  aiGuides?: IAIGuide[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IThreadItem extends Document {
  uid: mongoose.Types.ObjectId;
  theme: string;
  questions?: Array<mongoose.Types.ObjectId | IQASet>;
  synthesized?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserORM extends IUserBase, Document {
  _id: mongoose.Types.ObjectId
  threadRef: Array<mongoose.Types.ObjectId | IThreadItem>
}

export const AIGuideSchema = new Schema({
  content: {type: String},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date}
 })

AIGuideSchema.set('timestamps', true)

export const QASetSchema = new Schema({
  question: {
    type: {
      label: {type: String},
      content: {type: String, required: true}
    },
    required: true
  },
  aiGuides: {
    type: [AIGuideSchema],
    default: []
  },
  keywords: [String],
  response: String,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date}
 })

QASetSchema.set('timestamps', true);
 
export const ThreadItemSchema = new Schema({
   uid: {type: Schema.Types.ObjectId, ref: 'User', required: true},
   theme: {type: String, required: true},
   questions: {type: [Schema.Types.ObjectId], ref: 'QASet', required: true, default: []},
   synthesized: {type: String},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 });
 
ThreadItemSchema.set('timestamps', true)

export const UserSchema = new Schema({
    alias: {type: String, required: true, unique: true},
    name: {type: String, required: false},
    passcode: {type: String, required: true},
    isKorean: {type: Boolean, required: true, default: true},
    initial_narrative: {type: String, required: false, default: null},
    value_set: {type: [String], required: true, default: []},
    background: {type: String, required: false, default: null},
    threadRef: {type: [Schema.Types.ObjectId], ref: 'ThreadItem', required: true, default: []},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date}
 });
 
UserSchema.set('timestamps', true);
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
      delete ret.passcode;
      return ret;
  }
})
 
export const QASet = mongoose.model<IQASet>('QASet', QASetSchema)
export const ThreadItem = mongoose.model<IThreadItem>('ThreadItem', ThreadItemSchema)
export const User = mongoose.model<IUserORM>('User', UserSchema)