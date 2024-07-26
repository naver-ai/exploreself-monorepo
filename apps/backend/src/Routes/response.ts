import express from 'express';
import { IThreadORM, QASet, ThreadItem, User } from "../config/schema";
import generateScaffoldingKeywords from '../Utils/old/generateScaffoldingKeywords'
import { IInitInfo } from "../config/interface";
import generateSentencesFromKeywords from "../Utils/old/generateSentencesFromKeywords";
import generateThemeScaffoldingKeywords from '../Utils/old/generateThemeScaffoldingKeywords'
import {generateScaffoldingQuestions} from '../Utils/old/generateScaffoldingQuestions'
import type { RequestWithUser } from './middlewares';

var router = express.Router()

const saveResponse = async (req: RequestWithUser, res) => {
  const user = req.user;
  const uid = user._id
  const threadItem: IThreadORM= req.body.thread_item;

  try {
    await User.findByIdAndUpdate(uid, {$push: {thread: threadItem}})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

const saveQASet = async (req, res) => {
  const tid = req.body.tid
  const question = req.body.question
  const keywords = req.body.keywords
  const response = req.body.answer
  const newQAset = new QASet({
    tid: tid,
    question: {content: question},
    keywords: keywords,
    response: response
  })
  try {
    await newQAset.save()
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      err: err.message,
      success: false
    })
  }
  
}

const saveOrientingInput = async(req, res) => {
  const orientingInput = req.body.orientingInput
  const tid = req.body.tid
  try {
    await ThreadItem.findByIdAndUpdate(tid, {$set: {orientingInput: orientingInput}})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      err: err.message
    })
    throw err;
  }
}

const generateKeywords = async (req: RequestWithUser, res) => {
  const user = req.user
  const question = req.body.question; // type: object

  const initInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }

  //TODO fix new schema error
  const granularItems = await generateScaffoldingKeywords(initInfo, question, user.threadRef as any, 1)
  res.json({
    granularItems: granularItems
  })

}

const generateSentences = async (req: RequestWithUser, res) => {
  const question = req.body.question;
  const selected_keywords = req.body.selected_keywords;
  const user = req.user
  const initInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }

  const thread = user.threadRef

  //TODO fix new use schema issue
  const sentences = await generateSentencesFromKeywords(initInfo, thread as any, question, selected_keywords)
  res.json({
    generated_sentences: sentences.plausible_answers
  })
}

const getScaffoldingQuestions = async (req: RequestWithUser, res) => {
  const question = req.body.question;
  const user = req.user
  const initInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }
  
  const questions = await generateScaffoldingQuestions(initInfo, question)
  res.json({
    questions: questions
  })
}

const getThemeScaffoldingKeywords = async(req: RequestWithUser, res) => {
  const user = req.user
  const uid = user._id
  const theme = req.body.theme

  try {
    const scaffoldingSet = await generateThemeScaffoldingKeywords(uid, theme)
    res.json({
      scaffoldingSet: scaffoldingSet
    })
  } catch (err){
    res.json({
      err: err.message
    })
  }
}

router.post('/saveResponse', saveResponse);
router.post('/generateKeywords', generateKeywords);
router.post('/generateSentences', generateSentences);
router.post('/getScaffoldingQuestions', getScaffoldingQuestions);
router.post('/saveOrientingInput', saveOrientingInput);
router.post('/getThemeScaffoldingKeywords', getThemeScaffoldingKeywords)
router.post('/saveQASet', saveQASet)

export default router;

