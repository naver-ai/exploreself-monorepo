import { Request, Response } from 'express';
import { User } from '../config/schema';
import { uid } from '../config/config';
import generateThemesFromNarrative from '../newUtils/generateThemesFromNarrative'
import { IInitInfo } from '../config/interface';
import { generateQuestionsbyInfo } from '../newUtils/generateQuestionsbyInfo';

const generateInitialThemes = async (req: Request, res: Response) => {
  const user = await User.findById(uid);
  if (!user) {
    res.status(400).send('User not found');
  }
  const basicInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }
  const themes = await generateThemesFromNarrative(basicInfo);

  res.json({
    themes: themes
  })
}

const generateQuestions = async (req: Request, res: Response) => {

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

  const questions = await generateQuestionsbyInfo(basicInfo, threadLog, selected_theme)
  res.json({
    questions: questions
  })

}

export {generateInitialThemes, generateQuestions}