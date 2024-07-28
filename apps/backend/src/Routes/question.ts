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

const generateQuestionsHandler = async (req: RequestWithUser, res) => {
  const uid = req.user._id;
  const tid = req.params.tid
  try {
    const questions = await generateQuestions(uid, tid)
    const qaPromises = questions.map(async(question, index) => {
      const newQASet = new QASet({
        tid: tid,
        question: {content: question},
        selected: false
      })
      return newQASet.save()
    })
    const savedQASets = await Promise.all(qaPromises);
    const qaSetIds = savedQASets.map(qa => qa._id)
    const threadItem = await ThreadItem.findByIdAndUpdate(tid, 
      {$push: {$each: qaSetIds}}
    )
    res.json({
      questions: savedQASets
    })
  } catch (err) {
    res.json({
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

router.get('/:qid', signedInUserMiddleware, getQuestionData )
router.post('/generateReflexive', signedInUserMiddleware, generateReflexiveQuestionsController);
router.get('/generate/:tid', signedInUserMiddleware, generateQuestionsHandler)

export default router;

 