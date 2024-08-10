import express from 'express';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';
import { InteractionType } from '@core';
import { logInteraction } from '../utils/logInteraction';

const router = express.Router()

const logInteractionData = async(req: RequestWithUser, res) => {
  try {
    const orm = await logInteraction(req.user, req.body.interaction_type, req.body.interaction_data, req.body.metadata, req.body.timestamp)
    return res.json({success: true})
  } catch (err) {
    console.log("Err in logging interaction: ", err)
    return res.json({err: err.message, success: false})
  }
}

router.post(`/`, signedInUserMiddleware, logInteractionData)
export default router;
