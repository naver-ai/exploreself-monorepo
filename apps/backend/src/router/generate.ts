import express from 'express';
import { QASet, ThreadItem, User } from '../config/schema';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';
import generateComment from '../utils/generateComment';
import generateKeywords from '../utils/generateKeywords';
import generateThemes from '../utils/generateThemes';
import generateQuestions from '../utils/generateQuestions';
import generatePrompt from '../utils/generatePrompt';
import { generateSummary, mapSummaryToQIDs } from '../utils/summary';

const router = express.Router()

const generateKeywordsHandler = async(req:RequestWithUser, res) => {
  const user = req.user
  const uid = user._id
  const qid = req.params.qid
  const opt = parseInt(req.query.opt as string, 10)
  try {
    const keywords = await generateKeywords(user, qid, opt)
    const updatedQuestion = await QASet.findByIdAndUpdate(qid, {$push: {keywords: {$each: keywords.map(item => item.keyword)}}})
    return res.json({
      keywords: keywords
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
}

const generateThemesHandler = async (req: RequestWithUser, res) => {
  const user = req.user;
  const uid = user._id;
  const prevThemes = req.body.prevThemes
  const opt = req.body.opt
  try {
    const themes = await generateThemes(uid, prevThemes, opt)
    res.json({
      themes: themes
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

const generatePromptHandler = async(req: RequestWithUser, res) => {
  const user = req.user;
  const {qid, keyword, curr_response, opt} = req.body
  try {
    const prompts  = await generatePrompt(user, qid, keyword, curr_response, opt)
    //TODO: Add to DB; log interaction data
    return res.json({
      prompts: prompts.map((prompt: {prompt: string, rationale: string}) => prompt.prompt)
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
}


router.post('/comment/:qid', signedInUserMiddleware, async (req: RequestWithUser, res) => {
  const user = req.user
  const qid = req.params.qid
  const response = req.body.response
  try {
    const comments = await generateComment(user, qid, response)
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

router.post('/question/:tid', signedInUserMiddleware, async (req: RequestWithUser, res) => {
  const uid = req.user._id;
  const tid = req.params.tid;
  const opt = parseInt(req.query.opt as string, 10)
  const prevQ = req.body.prevQ
  try {
    const questions = await generateQuestions(uid, tid, opt, prevQ)
    const qaPromises = questions.map(async(question, index) => {
      const newQASet = new QASet({
        tid: tid,
        question: {content: question.question},
        selected: false
      })
      return newQASet.save()
    })
    const savedQASets = await Promise.all(qaPromises);
    const qaSetIds = savedQASets.map(qa => qa._id)
    const threadItem = await ThreadItem.findByIdAndUpdate(tid, 
      {$push: { questions: { $each: qaSetIds } }}
    )
    return res.json({
      questions: savedQASets
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

)
router.get('/keywords/:qid', signedInUserMiddleware, generateKeywordsHandler)
router.post('/themes', signedInUserMiddleware, generateThemesHandler)
router.post('/prompt/:qid', signedInUserMiddleware, generatePromptHandler)

router.put('/summary', signedInUserMiddleware,  async(req: RequestWithUser, res) => {
  const user = req.user;
  try {
    const summaryItems = await generateSummary(user)
    const userUpdated = await User.findByIdAndUpdate(user._id, {$push: {summaries: summaryItems}})
    // TODO: Add log interaction data
    res.json({summaries: summaryItems})
  } catch (err) {
    res.json({
      err: err.message
    })
  }
})


router.put('/summary_mappings', signedInUserMiddleware, async(req: RequestWithUser, res) => {
  const user = req.user;
  try {
    const summary = await generateSummary(user)
    const mappings = await mapSummaryToQIDs(user, summary);
    const userUpdated = await User.findByIdAndUpdate(user._id, {$push: {summaries: summary}})
    // TODO: Add log interaction data
    res.json({summaryMappings: mappings})
  } catch (err) {
    res.json({
      err: err.message
    })
  }
})


export default router;

