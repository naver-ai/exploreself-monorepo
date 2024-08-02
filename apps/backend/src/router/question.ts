import express from 'express';
import { IQASetORM, IThreadORM, QASet, ThreadItem, User } from '../config/schema';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';


const router = express.Router()

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

const selectQuestion = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: true}}, {new: true})
    res.json({
      success: true,
      qaSet: updatedQASet
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

const unSelectQuestion = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {selected: false}}, {new: true})
    res.json({
      success: true,
      qaSet: updatedQASet
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}

const getComment = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  try {
    const qaSet = await QASet.findById(qid)
    const commentList = qaSet.aiGuides
    return res.json({
      commentList: commentList
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
}

router.get('/:qid', signedInUserMiddleware, getQuestionData )
router.put('/:qid/select', signedInUserMiddleware, selectQuestion)
router.put('/:qid/unselect', signedInUserMiddleware, unSelectQuestion)
router.get('/:qid/comment', signedInUserMiddleware, getComment)

export default router;

 