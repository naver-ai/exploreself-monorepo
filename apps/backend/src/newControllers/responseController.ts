import { Request, Response } from "express";
import { IThreadItem, ThreadItem, User } from "../config/schema";
import generateScaffoldingKeywords from '../newUtils/generateScaffoldingKeywords'
import { IInitInfo } from "../config/interface";
import generateSentencesFromKeywords from "../newUtils/generateSentencesFromKeywords";
import generateThemeScaffoldingKeywords from '../newUtils/generateThemeScaffoldingKeywords'
import {generateScaffoldingQuestions} from '../newUtils/generateScaffoldingQuestions'

const saveResponse = async (req: Request, res: Response) => {
  const threadItem: IThreadItem = req.body.thread_item;
  const uid: string = req.body.uid

  try {
    await User.findByIdAndUpdate(uid, {$push: {thread: threadItem}})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

const saveOrientingInput = async(req: Request, res: Response) => {
  const orientingInput = req.body.orientingInput
  const tid = req.body.tid
  try {
    await ThreadItem.findByIdAndUpdate(tid, {$set: {orientingInput: orientingInput}})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      err: err.message
    })
    throw err;
  }
}

const generateKeywords = async (req: Request, res: Response) => {

  const question = req.body.question; // type: object
  const uid = req.body.uid
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  const initInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }

  const granularItems = await generateScaffoldingKeywords(initInfo, question, user.thread, 1)
  res.json({
    granularItems: granularItems
  })

}

const generateSentences = async (req: Request, res: Response) => {
  const question = req.body.question;
  const selected_keywords = req.body.selected_keywords;
  const uid = req.body.uid
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  const initInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }

  const thread = user.thread

  const sentences = await generateSentencesFromKeywords(initInfo, thread, question, selected_keywords)
  res.json({
    generated_sentences: sentences.plausible_answers
  })
}

const getScaffoldingQuestions = async (req: Request, res: Response) => {
  const question = req.body.question;
  const uid = req.body.uid
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  const initInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }
  
  const questions = await generateScaffoldingQuestions(initInfo, question)
  res.json({
    questions: questions
  })
}

const getThemeScaffoldingKeywords = async(req: Request, res: Response) => {
  const uid = req.body.uid
  const theme = req.body.theme

  try {
    const scaffoldingSet = await generateThemeScaffoldingKeywords(uid, theme)
    res.json({
      scaffoldingSet: scaffoldingSet
    })
  } catch (err){
    res.json({
      err: err.message
    })
  }
}

export {saveResponse, generateKeywords, generateSentences, getScaffoldingQuestions, saveOrientingInput, getThemeScaffoldingKeywords}