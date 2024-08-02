import { IThreadBase, IUserBase, IQASetBase } from "@core";
import mongoose, {Schema, Document, mongo} from "mongoose";
import { InteractionType, InteractionBase } from "@core";

export function emptyStringToUndefinedConverter(value: string | undefined){
  return value === '' ? undefined : value;
}

export interface IAIGuide extends Document {
  content: string;
  rateGood?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQASetORM extends IQASetBase, Document {
  _id: mongoose.Types.ObjectId
  tid: mongoose.Types.ObjectId
}
export interface IThreadORM extends IThreadBase, Document {
  _id: mongoose.Types.ObjectId
  questions: Array<mongoose.Types.ObjectId | IQASetORM>
  uid: mongoose.Types.ObjectId
}

export interface IUserORM extends IUserBase, Document {
  _id: mongoose.Types.ObjectId
  threads: Array<mongoose.Types.ObjectId | IThreadORM>
}
export interface InteractionORM extends InteractionBase, Document {
  _id: mongoose.Types.ObjectId;
  metadata: Record<string, any>;
  createdAt: Date
}


export const AIGuideSchema = new Schema({
  content: {type: String},
  rateGood: {type: Boolean},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date}
 })

AIGuideSchema.set('timestamps', true)

export const QASetSchema = new Schema({
  tid: {type: Schema.Types.ObjectId, ref: 'ThreadItem', required: true},
  question: {
    type: {
      label: {type: String},
      content: {type: String, required: true}
    },
    required: true
  },
  selected: {type: Boolean, default: false},
  aiGuides: {
    type: [AIGuideSchema],
    default: []
  },
  keywords: {type: [String], default: []},
  response: {type: String, default: ''},
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
    initialNarrative: {type: String, required: false, default: null, set: emptyStringToUndefinedConverter},
    threads: {type: [Schema.Types.ObjectId], ref: 'ThreadItem', required: true, default: []},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date}
 });
 
UserSchema.set('timestamps', true);
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
      delete ret.passcode;
      if(ret.initialNarrative != null && ret.initialNarrative == ''){
        ret.initialNarrative = undefined
      }
      return ret;
  }
})

const InteractionSchema = new Schema<InteractionORM>({
  interaction_type: { type: String, enum: Object.values(InteractionType), required: true },
  metadata: { type: Schema.Types.Mixed, required: true },
  interaction_data: { type: Schema.Types.Mixed },
  createdAt: {type: Date, default: Date.now},
});

InteractionSchema.set('timestamps', true);
 
export const QASet = mongoose.model<IQASetORM>('QASet', QASetSchema)
export const ThreadItem = mongoose.model<IThreadORM>('ThreadItem', ThreadItemSchema)
export const User = mongoose.model<IUserORM>('User', UserSchema)
export const Interaction = mongoose.model<InteractionORM>('Interaction', InteractionSchema);
