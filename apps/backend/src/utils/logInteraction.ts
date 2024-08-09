import { InteractionType } from "@core";
import mongoose from "mongoose";
import { Interaction, InteractionORM, IUserORM } from "../config/schema";

export async function logInteraction(user: IUserORM, 
    type: InteractionType, 
    data?: Record<string, any>, 
    metadata?: Record<string, any>,
    timestamp?: number | Date
): Promise<InteractionORM>{
    const newInteraction = new Interaction({
        user: user._id,
        type,
        data,
        metadata,
        timestamp: timestamp || Date.now()
      })
    await newInteraction.save()

    console.log(newInteraction.type, "|", user.alias, "|", newInteraction.timestamp, "|", JSON.stringify(newInteraction.data), "|", JSON.stringify(newInteraction.metadata))

    return newInteraction
}