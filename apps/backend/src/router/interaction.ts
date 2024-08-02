import express from 'express';
import { Interaction } from '../config/schema';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';
import { InteractionBase, InteractionType } from '@core';

var router = express.Router()

const logInteractionData = async(req: RequestWithUser, res) => {
  const uid = req.user._id.toString();
  const {interaction_type, interaction_data, metadata} = req.body as {
    interaction_type: InteractionType;
    interaction_data: Record<string, any> | {};
    metadata: Record<string, any> | {};
  };

  try {
    const newInteraction = new Interaction({
      interaction_type: interaction_type,
      interaction_data: interaction_data,
      metadata: {...metadata, uid: uid}
    })
    await newInteraction.save()
    return res.json({success: true})
  } catch (err) {
    console.log("Err in logging interaction: ", err)
    return res.json({err: err.message, success: false})
  }
}

router.post(`/`, signedInUserMiddleware, logInteractionData)
export default router;
