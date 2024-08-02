import express from 'express';
import { IThreadORM, Interaction, QASet, ThreadItem, User } from "../config/schema";
import type { RequestWithUser } from './middlewares';
import { signedInUserMiddleware } from './middlewares';
import { synthesizeThread } from '../utils/synthesizeThread';
import { IAIGuide, InteractionType } from '@core';

var router = express.Router()


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

const updateResponse = async (req, res) => {
  const qid = req.params.qid
  const response = req.body.response
  const interaction = req.body.interaction
  try {
    const updatedQASet = await QASet.findByIdAndUpdate(qid,{$set: {response: response}})
    const {interaction_type, interaction_data, metadata} = interaction
    const newInteraction = new Interaction({
      interaction_type: interaction_type,
      interaction_data: interaction_data,
      metadata: {...metadata, uid: req.user._id}
    })
    await newInteraction.save()
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

