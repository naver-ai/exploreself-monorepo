import express from 'express';
import { QASet, ThreadItem, User } from '../config/schema';
import { generateReflexiveQuestions } from '../Utils/old/generateReflexiveQuestions';
import generateQuestions from '../Utils/generateQuestions';
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
const selectQuestion = async(req, res) => {
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

router.get('/:qid', signedInUserMiddleware, getQuestionData )
router.post('/generateReflexive', signedInUserMiddleware, generateReflexiveQuestionsController);
router.put('/select/:qid', signedInUserMiddleware, selectQuestion)

export default router;

 