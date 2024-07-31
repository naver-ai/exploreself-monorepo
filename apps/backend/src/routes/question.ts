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

const getUnselectedQuestionList = async (req: RequestWithUser, res) => {
  const tid = req.params.tid
  try {
    const thread = await ThreadItem.findById(tid).populate('questions').exec() as IThreadORM & {questions: Array<IQASetORM>}
    const unSelectedQuestionList = thread.questions.filter((question: IQASetORM) => !question.selected).map(q => q._id)
    return res.json({
      unSelectedQuestionList: unSelectedQuestionList
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
}

const getSelectedQuestionList = async (req: RequestWithUser, res) => {
  const tid = req.params.tid
  try {
    const thread = await ThreadItem.findById(tid).populate('questions').exec() as IThreadORM & {questions: Array<IQASetORM>}
    const selectedQuestionList = thread.questions.filter((question: IQASetORM) => question.selected).map(q => q._id)
    return res.json({
      selectedQuestionList: selectedQuestionList
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
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: true}})
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

const unSelectQuestion = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: false}})
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

router.get('/unselected/:tid', signedInUserMiddleware, getUnselectedQuestionList )
router.get('/selected/:tid', signedInUserMiddleware, getSelectedQuestionList )
router.get('/:qid', signedInUserMiddleware, getQuestionData )
router.post('/generateReflexive', signedInUserMiddleware, generateReflexiveQuestionsController);
router.put('/select/:qid', signedInUserMiddleware, selectQuestion)
router.put('/unselect/:qid', signedInUserMiddleware, unSelectQuestion)

export default router;

 