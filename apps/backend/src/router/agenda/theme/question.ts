import express from 'express';
import { QASet, ThreadItem } from '../../../config/schema';
import type {RequestWithAgenda, RequestWithUser} from '../../middlewares'
import { signedInUserMiddleware } from '../../middlewares';
import { IAIGuide, InteractionBase } from '@core';
import { logInteraction } from 'apps/backend/src/utils/logInteraction';
import generateComment from 'apps/backend/src/utils/generateComment';
import generateKeywords from 'apps/backend/src/utils/generateKeywords';
import { body } from 'express-validator';
import generateQuestions from 'apps/backend/src/utils/generateQuestions';


const router = express.Router()

router.post('/generate', body('opt').optional().toInt(10), body("prevQuestions").isArray().optional(), async (req: RequestWithAgenda, res) => {
  try {
    const thread = await ThreadItem.findById(req.params.tid)
    
    const questions = await generateQuestions(req.user, req.agenda, thread, req.body.opt, req.body.prevQuestions)
    const qaPromises = questions.map(async(question, index) => {
      const newQASet = new QASet({
        tid: thread._id,
        question: {content: question.question},
        selected: false
      })
      return newQASet.save()
    })
    const savedQASets = await Promise.all(qaPromises);
    const qaSetIds = savedQASets.map(qa => qa._id)
    thread.questions.push(qaSetIds as any)
    await thread.save()

    return res.json({
      questions: savedQASets
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
})

router.get('/:qid', async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const qData = await QASet.findById(qid)
    return res.json({
      qData: qData
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
})

router.put('/:qid/select', async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: true, selectedAt: Date.now()}}, {new: true})
    res.json({
      success: true,
      qaSet: updatedQASet
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
})


router.put('/:qid/unselect', async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: false}}, {new: true})
    res.json({
      success: true,
      qaSet: updatedQASet
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
})



// The upper APIs are currently deprecated, and will delete in order
router.post('/:qid/response', async (req: RequestWithUser, res) => {
  const qid = req.params.qid
  const response = req.body.response
  const interaction: InteractionBase = req.body.interaction
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {response: response}})
    await logInteraction(req.user, req.browserSessionId, interaction.type, interaction.data, interaction.metadata, interaction.timestamp)
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
})


router.get('/:qid/comments', async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const qaSet = await QASet.findById(qid)
    const commentList = qaSet.aiGuides
    return res.json({
      commentList: commentList
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
})


router.post('/:qid/comments/generate', body('response').optional(), async (req: RequestWithAgenda, res) => {
  const qid = req.params.qid
  const response = req.body.response
  try {
    const comments = await generateComment(req.user, req.agenda, qid, response)
    const updatedQuestion = await QASet.findByIdAndUpdate(qid, {$push: {aiGuides: {content: comments.selected.comment}}})
    return res.json({
      comments: (comments as any).selected
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
})

router.post('/:qid/keywords/generate', body('opt').toInt(10), async(req:RequestWithAgenda, res) => {
  const qid = req.params.qid
  try {
    const keywords = await generateKeywords(req.user, req.agenda, qid, req.body.opt)
    const updatedQuestion = await QASet.findByIdAndUpdate(qid, {$push: {keywords: {$each: keywords.map(item => item.keyword)}}})
    return res.json({
      keywords: keywords
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
})

export default router;

 