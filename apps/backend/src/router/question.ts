import express from 'express';
import { IQASetORM, IThreadORM, QASet, ThreadItem, User } from '../config/schema';
import { generateReflexiveQuestions } from '../utils/old/generateReflexiveQuestions';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';


var router = express.Router()

const getQuestionData = async(req: RequestWithUser, res) => {
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
}

const generateReflexiveQuestionsController = async (req: RequestWithUser, res) => {
  const user = req.user;
  const uid = user._id

  const selected_theme = req.body.selected_theme;
  const orienting_input = req.body.orienting_input;

  const questions = await generateReflexiveQuestions(uid, selected_theme, orienting_input)
  res.json({
    questions: questions
  })
}
const selectQuestion = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: true}}, {new: true})
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
}

const unSelectQuestion = async(req: RequestWithUser, res) => {
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
}

const getComment = async(req: RequestWithUser, res) => {
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
}

router.post('/generateReflexive', signedInUserMiddleware, generateReflexiveQuestionsController);
router.get('/:qid', signedInUserMiddleware, getQuestionData )
router.put('/:qid/select', signedInUserMiddleware, selectQuestion)
router.put('/:qid/unselect', signedInUserMiddleware, unSelectQuestion)
router.get('/:qid/comment', signedInUserMiddleware, getComment)

export default router;

 