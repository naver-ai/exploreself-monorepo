import { IThreadBase, IUserBase, IQASetBase, SessionStatus, IUserBrowserSessionBase } from "@core";
import mongoose, {Schema, Document, mongo} from "mongoose";
import { InteractionType, InteractionBase } from "@core";
import * as nanoid from 'nanoid'

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
  browserSessions: Array<mongoose.Types.ObjectId | BrowserSessionORM>
}
export interface InteractionORM extends InteractionBase, Document {
  _id: mongoose.Types.ObjectId;
  metadata: Record<string, any>;
  createdAt: Date
  user: mongoose.Types.ObjectId
}

export interface BrowserSessionORM extends IUserBrowserSessionBase, Document {
  _id: mongoose.Types.ObjectId;
  interactionLogs: Array<mongoose.Types.ObjectId | InteractionORM>
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
  updatedAt: {type: Date},
  selectedAt: {type: Date, default: null}
 })

QASetSchema.set('timestamps', true);
 
export const ThreadItemSchema = new Schema({
   uid: {type: Schema.Types.ObjectId, ref: 'User', required: true},
   theme: {type: String, required: true},
   questions: {type: [Schema.Types.ObjectId], ref: 'QASet', required: true, default: []},
   synthesized: {type: String, required: false, default: undefined},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 });
 
ThreadItemSchema.set('timestamps', true)

export const BrowserSessionSchema = new Schema<BrowserSessionORM>({
  localTimezone: {type: String, nullable: true, default: null},
  interactionLogs: {type: [Schema.Types.ObjectId], ref: 'Interaction', default: []},
  startedTimestamp: {type: Number, index: true, default: Date.now},
  endedTimestamp: {type: Number, nullable: true, default: null, index: true},
})

export const UserSchema = new Schema({
    alias: {type: String, required: true, unique: true},
    name: {type: String, required: false},
    passcode: {type: String, required: true, unique: true, default: () => nanoid.customAlphabet('1234567890', 6) },
    isKorean: {type: Boolean, required: true, default: true},
    initialNarrative: {type: String, required: false, default: null, set: emptyStringToUndefinedConverter},
    threads: {type: [Schema.Types.ObjectId], ref: 'ThreadItem', required: true, default: []},
    synthesis: {type: [String], required: true, default: []},
    pinnedThemes: {type: [String], required: true, default: []},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date},
    debriefing: {type: String, required: false, default: null, set: emptyStringToUndefinedConverter},
    sessionStatus: {type: String, enum: Object.keys(SessionStatus), default: SessionStatus.Exploring},
    browserSessions: {type: [Schema.Types.ObjectId], ref: 'BrowserSession', required: true, default: []},
  });
 
UserSchema.set('timestamps', true);
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
      // delete ret.passcode;
      if(ret.initialNarrative != null && ret.initialNarrative == ''){
        ret.initialNarrative = undefined
      }
      return ret;
  }
})

const InteractionSchema = new Schema<InteractionORM>({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  type: { type: String, enum: Object.values(InteractionType), required: true },
  metadata: { type: Schema.Types.Mixed, required: false},
  data: { type: Schema.Types.Mixed, required: false},
  timestamp: {type: Date, default: Date.now},
  createdAt: {type: Date, default: Date.now},
});

InteractionSchema.set('timestamps', true);

export const QASet = mongoose.model<IQASetORM>('QASet', QASetSchema)
export const ThreadItem = mongoose.model<IThreadORM>('ThreadItem', ThreadItemSchema)
export const User = mongoose.model<IUserORM>('User', UserSchema)
export const Interaction = mongoose.model<InteractionORM>('Interaction', InteractionSchema);
export const BrowserSession = mongoose.model<BrowserSessionORM>('BrowserSession', BrowserSessionSchema)
