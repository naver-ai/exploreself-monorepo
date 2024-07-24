import { Request, Response } from 'express';
import { User } from '../config/schema';
import { IInitInfo } from '../config/interface';
import { generateSocraticQuestions } from '../newUtils/generateSocraticQuestions';
import { generateOrientingQuestions } from '../newUtils/generateOrientingQuestions';

const generateSocraticQuestionController = async (req: Request, res: Response) => {
  const uid = req.body.uid

  const selected_theme = req.body.selected_theme;
  const orienting_input = req.body.orienting_input;

  const questions = await generateSocraticQuestions(uid, selected_theme, orienting_input)
  res.json({
    questions: questions
  })
}

const generateOrientincQuestionsController = async (req: Request, res: Response) => {
  const uid = req.body.uid
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  const selected_theme = req.body.selected_theme;
  const threadLog = user.thread

  // const history = user.history.map(historyItem => historyItem.history_information);

  const basicInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }

  const questions = await generateOrientingQuestions(basicInfo, threadLog, selected_theme)
  res.json({
    questions: questions
  })
}

export {generateSocraticQuestionController, generateOrientincQuestionsController}