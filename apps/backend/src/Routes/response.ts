import express from 'express';
import { IThreadORM, QASet, ThreadItem, User } from "../config/schema";
import { IInitInfo } from "../config/interface";
import generateSentencesFromKeywords from "../utils/old/generateSentencesFromKeywords";
import generateThemeScaffoldingKeywords from '../utils/old/generateThemeScaffoldingKeywords'
import {generateScaffoldingQuestions} from '../utils/old/generateScaffoldingQuestions'
import type { RequestWithUser } from './middlewares';
import { signedInUserMiddleware } from './middlewares';
import { synthesizeThread } from '../utils/synthesizeThread';
import { IAIGuide } from '@core';

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

const saveComment = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  const comment: IAIGuide = {content: req.body.comment as string}
  try {
    await QASet.findByIdAndUpdate(qid, {$push: {aiGuides: comment}})
    return res.json({
      success: true
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
}

const createQASet = async (req, res) => {
  const tid = req.body.tid
  const qaSet = req.body.qaSet;
  try {
    const newQASet = new QASet({
      tid: tid,
      question: {content: qaSet.question.content},
      keywords: [],
      response: ''
    }) 
    const savedQASet= await newQASet.save()
    await ThreadItem.findByIdAndUpdate(tid, {
      $push: { questions: savedQASet._id }
    });
    res.json({
      success: true,
      qaSet: savedQASet._id
    })
  } catch (err) {
    res.json({
      err: err.message,
      success: false
    })
  }
}

const updateKeywords = async (req, res) => {
  const qid = req.body.qid
  const keywords = req.body.keywords
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {keywords: keywords}})
    res.json({
      success: true,
      qaSet: updatedQASet._id
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

const updateResponse = async (req, res) => {
  const qid = req.params.qid
  const response = req.body.response
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {response: response}})
    res.json({
      success: true,
      qaSet: updatedQASet._id
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}
const updateQASet = async (req, res) => {
  const qid = req.body.qid
  const keywords = req.body.keywords
  const response = req.body.response
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {keywords: keywords, response: response}})
    res.json({
      success: true,
      qaSet: updatedQASet._id
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

const saveQASetArray = async (req, res) => {
  const tid = req.body.tid
  const qalist = req.body.qalist;
  try {
    const qaPromises = qalist.map(async (qa, index) => {
      const updatedQASet = await QASet.findOneAndUpdate(
        { tid: qa.tid, 'question.content': qa.question.content },
        {
          tid: qa.tid,
          question: { content: qa.question.content },
          selected: true,
          keywords: qa.keywords,
          response: qa.response
        },
        { new: true, upsert: true } 
      );
      return updatedQASet;
    })
    const savedQASets = await Promise.all(qaPromises);
    const qaSetIds = savedQASets.map(qa => qa._id.toString());
    const threadItem = await ThreadItem.findById(tid);

    const existingQaSetIds = threadItem.questions.map(id => id.toString());
    const uniqueIds = new Set();
    const combinedQaSetIds = [];

    [...existingQaSetIds, ...qaSetIds].forEach(id => {
      if (!uniqueIds.has(id)) {
        uniqueIds.add(id);
        combinedQaSetIds.push(id);
      }
    });

    await ThreadItem.findByIdAndUpdate(tid, {
      $push: { questions: { $each: qaSetIds } }
    });

    const synthesis = await synthesizeThread(tid);
    await ThreadItem.findByIdAndUpdate(tid, {
      $set: { synthesis: synthesis }
    });

    res.json({
      success: true,
      qaIds: qaSetIds
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
    generated_sentences: (sentences as any).plausible_answers
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



router.post('/saveResponse', signedInUserMiddleware, saveResponse);
router.post('/generateSentences', signedInUserMiddleware, generateSentences);
router.post('/getScaffoldingQuestions', signedInUserMiddleware, getScaffoldingQuestions);
router.post('/saveOrientingInput', signedInUserMiddleware, saveOrientingInput);
router.post('/getThemeScaffoldingKeywords', signedInUserMiddleware, getThemeScaffoldingKeywords)
router.post('/saveQASetArray', signedInUserMiddleware, saveQASetArray)
router.post('/createQASet', signedInUserMiddleware, createQASet)
router.post('/updateQASet', signedInUserMiddleware, updateQASet)
router.post('/updateKeywords', signedInUserMiddleware, updateKeywords)
// The upper APIs are currently deprecated, and will delete in order
router.put('/:qid', signedInUserMiddleware, updateResponse)
router.put('/comment/:qid', signedInUserMiddleware, saveComment)

export default router;

