import express from 'express';
import { User } from '../config/schema';
import { generateReflexiveQuestions } from '../Utils/old/generateReflexiveQuestions';
import generateQuestions from '../Utils/generateQuestions';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';


var router = express.Router()


const generateQuestionsHandler = async (req: RequestWithUser, res) => {
  const uid = req.user._id;
  const tid = req.body.tid
  try {
    const questions = await generateQuestions(uid, tid)
    res.json({
      questions: questions
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


router.post('/generateReflexive', signedInUserMiddleware, generateReflexiveQuestionsController);
router.post('/getQuestions', signedInUserMiddleware, generateQuestionsHandler)

export default router;

 