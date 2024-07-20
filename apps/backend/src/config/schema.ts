import mongoose from "mongoose";
const { Schema } = mongoose;

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
   generated_sentence: {
     type: [{
       type: String, 
       selected: Boolean
     }],
     required: function(){return this.tried;}
   },
   ai_synthesize: {type: String, required: function(){return this.tried;}},
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
   question: {type: String, required: true},
   scaffoldingData: {
     type: ScaffoldingDataSchema,
     required: true
   },
   response: {
     type: String,
     required: true
   },
   history_information: {type: [String], required: true},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 });
 
 ThreadItemSchema.set('timestamps', true)
 
 const UserSchema = new Schema({
   name: {type: String, required: true},
   initial_narrative: {type: String, required: true},
   background: {type: String, required: true},
   thread: {type: [{type: Schema.Types.ObjectId, ref: 'ThreadItem'}], default: [], required: true},
   createdAt: {type: Date, default: Date.now},
   updatedAt: {type: Date}
 });
 
 UserSchema.set('timestamps', true);
 
 
 const ThreadItem = mongoose.model('ThreadItem', ThreadItemSchema)
 const User = mongoose.model('User', UserSchema)
 
 
 export {User, ThreadItem}