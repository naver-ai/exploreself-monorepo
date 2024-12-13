import express from 'express';
import { QASet } from "../config/schema";
import type { RequestWithUser } from './middlewares';
import { signedInUserMiddleware } from './middlewares';
import { IAIGuide, InteractionBase } from '@core';
import { logInteraction } from '../utils/logInteraction';

const router = express.Router()


const saveComment = async(req: RequestWithUser, res) => {
  const qid = req.params.qid
  const comment: IAIGuide = {content: req.body.comment as string}
  try {
    await QASet.findByIdAndUpdate(qid, {$push: {aiGuides: comment}})
    return res.json({
      success: true
    })
  } catch (err) {
    return res.json({
      err: err.message
    })
  }
}

const updateResponse = async (req: RequestWithUser, res) => {
  const qid = req.params.qid
  const response = req.body.response
  const interaction: InteractionBase = req.body.interaction
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {response: response}})
    await logInteraction(req.user, req.browserSessionId, interaction.type, interaction.data, interaction.metadata, interaction.timestamp)
    res.json({
      success: true,
      qaSet: updatedQASet._id
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }
}


// The upper APIs are currently deprecated, and will delete in order
router.post('/:qid', signedInUserMiddleware, updateResponse)
router.put('/comment/:qid', signedInUserMiddleware, saveComment)

export default router;

