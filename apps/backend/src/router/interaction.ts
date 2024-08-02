import express from 'express';
import { Interaction } from '../config/schema';
import type {RequestWithUser} from './middlewares'
import { signedInUserMiddleware } from './middlewares';
import { InteractionBase, InteractionType } from '@core';

var router = express.Router()

export interface LogInteractionRequest extends RequestWithUser {
  body: {
    interaction_type: InteractionType;
    interaction_data: Record<string, any>; 
    metadata: Record<string, any>; 
  };
}

const logInteractionData = async(req: RequestWithUser, res) => {
  const uid = req.user._id as string
  const {interaction_type, interaction_data, metadata} = req.body as {
    interaction_type: InteractionType;
    interaction_data: Record<string, any>;
    metadata: Record<string, any>;
  };

  try {
    const newInteraction = new Interaction({
      interaction_type: interaction_type,
      interaction_data: interaction_data,
      metadata: {...metadata, uid: uid}
    })
    return newInteraction.save()
  } catch (err) {
    console.log("Err in logging interaction: ", err)
  }
}

router.post(`/interaction_log`, signedInUserMiddleware, logInteractionData)
export default router;
