import mongoose from "mongoose";
const { Schema } = mongoose;

interface IAIFeedback extends Document {
  // TBD
}
interface ITypeAScaffolding extends Document {
  tried: boolean;
  unselected_keywords?: string[];
  selected_keywords: string[];
  user_added_keywords?: string[],
  selected_generated_sentence: string[];
  // ai_synthesize: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ITypeBQASet {
  question: string;
  selected: string[];
  unselected: string[];
}

interface ITypeBScaffolding extends Document {
  tried: boolean;
  qa_set: ITypeBQASet[];
  ai_synthesize: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITypeCPrompt {
  type: string;
  selected: boolean;
}

interface ITypeCPromptSet {
  tip: string;
  prompts: ITypeCPrompt[];
}

interface ITypeCScaffolding extends Document {
  tried: boolean;
  prompt_set: ITypeCPromptSet[];
  createdAt: Date;
  updatedAt: Date;
}

interface IScaffoldingData extends Document {
  typeA?: ITypeAScaffolding;
  typeB?: ITypeBScaffolding;
  typeC?: ITypeCScaffolding;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IThreadItem extends Document {
  uid: mongoose.Types.ObjectId;
  theme: string;
  question?: string;
  scaffoldingData?: IScaffoldingData;
  response?: string;
  history_information?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// interface IHistoryItem {
//   history_information: string;
//   threadItemRef?: mongoose.Types.ObjectId;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
interface IUser extends Document {
  name: string;
  ucode: string;
  isKorean: boolean;
  initial_narrative: string;
  value_set: string[];
  background: string;
  thread: IThreadItem[];
  threadRef: mongoose.Types.ObjectId[];
  // history: IHistoryItem[]
  createdAt: Date;
  updatedAt: Date;
}

const AIFeedbackSchema = new Schema({
  // TBD
 })
 
 const TypeAScaffoldingSchema = new Schema({
   tried: {type: Boolean, required: true},
   unselected_keywords: {type: [String], required: function(){return this.tried;}},
   selected_keywords: {
     type: [{
       content: { type: String, required: true },
       ai_generated: { type: Boolean, required: true }
     }],
     required: function() { return this.tried; }
   },
   selected_generated_sentence: {
     type: [String],
     required: function(){return this.tried;}
   },
  //  ai_synthesize: {type: String, required: function(){return this.tried;}},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 })
 
 const TypeBScaffoldingSchema = new Schema({
   tried: {type: Boolean, required: true},
   qa_set: {
     type: [{
       question: {type: String, required: true},
       selected: {type: [String], required: true},
       unselected: {type: [String], required: true},
     }],
     required: function() { return this.tried; }
   },
   ai_synthesize: {type: String, required: function(){return this.tried;}} ,
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 })
 
 const TypeCScaffoldingSchema = new Schema({
   tried: {type: Boolean, required: true},
   prompt_set: {
     type: [{
       tip: {type: String, required: true},
       prompts: {
         type: [{type: String, selected: Boolean}],
         required: true,
       }
     }],
     required: function(){return this.tried;}
   },
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 })
 
 const ScaffoldingDataSchema = new Schema({
   typeA: {
     type: TypeAScaffoldingSchema,
     required: true
   },
   typeB: {
     type: TypeBScaffoldingSchema,
     required: true
   },
   typeC: {
     type: TypeCScaffoldingSchema,
     required: true
   },
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 })
 
 const ThreadItemSchema = new Schema({
   uid: {type: Schema.Types.ObjectId, ref: 'User', required: true},
   theme: {type: String, required: true},
   question: {type: String},
   scaffoldingData: {
     type: ScaffoldingDataSchema},
   response: {type: String},
   history_information: {type: String},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 });
 
 ThreadItemSchema.set('timestamps', true)

 const UserSchema = new Schema({
   name: {type: String, required: true},
   ucode: {type: String, required: true},
   isKorean: {type: Boolean, required: true},
   initial_narrative: {type: String, required: true, default: ''},
   value_set: {type: [String], required: true, default: []},
   background: {type: String, required: true, default: ''},
   thread: {type: [ThreadItemSchema], default: [], required: true},
   threadRef: {type: [Schema.Types.ObjectId], ref: 'ThreadItem', required: true, default: []}, // TODO: Select one --- thread/threadRef
  //  thread: {type: [{type: Schema.Types.ObjectId, ref: 'ThreadItem'}], default: [], required: true},
  //  history: {type: [HistoryItemSchema], default: []},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 });
 
 UserSchema.set('timestamps', true);
 
 const ThreadItem = mongoose.model<IThreadItem>('ThreadItem', ThreadItemSchema)
 const User = mongoose.model<IUser>('User', UserSchema)
 
 export { User, IAIFeedback, ITypeAScaffolding, ITypeBScaffolding, ITypeCScaffolding, IScaffoldingData, IThreadItem, IUser, ThreadItem };
