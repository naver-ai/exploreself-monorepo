import { InteractionType } from "@core";
import mongoose from "mongoose";
import { BrowserSession, Interaction, InteractionORM, IUserORM } from "../config/schema";

export async function logInteraction(user: IUserORM, 
    browswerSessionId: string | undefined,
    type: InteractionType, 
    data?: Record<string, any>, 
    metadata?: Record<string, any>,
    timestamp?: number | Date,
    localTimezone?: string
): Promise<InteractionORM>{
    const newInteraction = new Interaction({
        user: user._id,
        type,
        data,
        metadata,
        timestamp: timestamp || Date.now()
      })
    await newInteraction.save()
    if(browswerSessionId){
        await BrowserSession.updateOne({_id: browswerSessionId}, {
            $push: {"interactionLogs": newInteraction}
        })
    }

    console.log(newInteraction.type, "|", user.alias, "|", newInteraction.timestamp, "|", JSON.stringify(newInteraction.data), "|", JSON.stringify(newInteraction.metadata))

    return newInteraction
}