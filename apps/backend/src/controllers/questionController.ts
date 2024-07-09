import { Request, Response } from 'express';
import { generateQuestionFromContext } from '../utils/questionChain/generateQuestion';
import { User } from '../config/schema';
import { ObjectId } from 'mongodb';
import { processHistory } from '../utils/helperFunc';
import { uid } from '../config/config';

const generateQuestion = async (req: Request, res: Response) => {

  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }

  const history = user.history;

  const history_log = await processHistory(history, res)

  const qType = req.body.qType;
  const theme = req.body.theme;

  const questions = await generateQuestionFromContext(history_log, theme, qType, res)
  res.json(questions)

}

export {generateQuestion}