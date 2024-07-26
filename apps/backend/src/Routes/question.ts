import express from 'express';
import { User } from '../config/schema';
import { IInitInfo } from '../config/interface';
import { generateReflexiveQuestions } from '../newUtils/generateReflexiveQuestions';
import { generateOrientingQuestions } from '../newUtils/generateOrientingQuestions';

var router = express.Router()


const generateReflexiveQuestionsController = async (req, res) => {
  const uid = req.body.uid

  const selected_theme = req.body.selected_theme;
  const orienting_input = req.body.orienting_input;

  const questions = await generateReflexiveQuestions(uid, selected_theme, orienting_input)
  res.json({
    questions: questions
  })
}

const generateOrientincQuestionsController = async (req, res) => {
  const uid = req.body.uid
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  const selected_theme = req.body.selected_theme;
  const threadLog = user.threadRef

  // const history = user.history.map(historyItem => historyItem.history_information);

  const basicInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }
  //TODO fix threadlog error in new schema
  const questions = await generateOrientingQuestions(basicInfo, threadLog as any, selected_theme)
  res.json({
    questions: questions
  })
}

router.post('/generateReflexive', generateReflexiveQuestionsController);
router.post('/generateOrienting', generateOrientincQuestionsController)

export default router;

 