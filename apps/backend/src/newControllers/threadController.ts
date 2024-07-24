import { ThreadItem, User } from "../config/schema"
import { Request, Response } from "express";
import synthesizeSession from "../newUtils/synthesizeSession";

const createThreadItem = async (req: Request, res: Response) => {
  
  const uid = req.body.uid
  const newThreadItem = new ThreadItem({
    uid: uid,
    theme: req.body.theme
  })
  try {
    const newThread = await newThreadItem.save()
    const threadid = newThread._id
    await User.findByIdAndUpdate(uid, {$push: {threadRef: threadid}})
    res.json({
      success: true,
      threadid: threadid
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

const saveThreadItem = async (req: Request, res: Response) => {
  const tid = req.body.tid;
  const question = req.body.question
  const scaffoldingData = req.body.scaffoldingData
  const response = req.body.response
  try {
    await ThreadItem.findByIdAndUpdate(tid, {$set: {
      question: question,
      // scaffoldingData: scaffoldingData,
      response: response
    }})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

const getOrientingInput = async (req: Request, res: Response) => {
  const tid = req.body.tid;
  try {
    const thread = await ThreadItem.findById(tid)
    res.json({
      orientingInput: thread.orientingInput
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

const getThreadList = async (req: Request, res: Response) => {
  const uid = req.body.uid
  try {
    // const user = await User.findById(uid).populate('threadRef').exec();
    const user = await User.findById(uid);
    return res.json({
      threadRef: user.threadRef
    })
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching thread list:' + err });
  }
}

const getThreadData = async (req: Request, res: Response) => {
  const tid = req.body.tid
  try {
    const thread = await ThreadItem.findById(tid);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    return res.json({
      threadData: thread
    })
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching thread data' + err });
  }
}

const getThreadTitleList = async (req: Request, res: Response) => {
  const {tids} = req.body
  try {
    const thread_themes = await ThreadItem.find({_id: {$in: tids}}).select('theme')
    res.json({
      themes: thread_themes
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

const synthesizeThread = async(req: Request, res: Response) => {
  const threadData = req.body.threadData
  const uid = req.body.uid
  try {
    const synthesizedData = await synthesizeSession(threadData, uid)
    res.json({
      synthesized: synthesizedData
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
}

const saveSynthesized = async(req: Request, res: Response) => {
  const synthesized = req.body.synthesized;
  const tid = req.body.tid
  try {
    await ThreadItem.findByIdAndUpdate(tid, {$set: {
      synthesized: synthesized,
    }})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

export {createThreadItem, getThreadList, saveThreadItem, getThreadData, getThreadTitleList, synthesizeThread, saveSynthesized, getOrientingInput}