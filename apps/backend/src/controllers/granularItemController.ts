import { Request, Response } from "express";
import { uid } from "../config/config";
import { User } from "../config/schema";
import generateGranularItems from "../utils/questionChain/generateGranularItems";
import { processHistory } from "../utils/helperFunc";

const generateGranularItemSet = async (req: Request, res: Response) => {
  // TODO: sophisticate granularity leve;

  const question = req.body.question; // type: object
  const qid = question._id
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  const history = user.history;
  const history_log = await processHistory(history, res)

  const granularItems = await generateGranularItems(question, history_log, 1)
  res.json({
    granularItems: granularItems
  })

}

const selectGranularItem = async (req: Request, res: Response) => {
  // TODO: implement
}

const unSelectGranularItem = async (req: Request, res: Response) => {
  // TODO: Implement
}

export {generateGranularItemSet}