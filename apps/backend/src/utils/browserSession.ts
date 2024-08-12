import { InteractionType } from "@core";
import { BrowserSession, IUserORM } from "../config/schema";
import { logInteraction } from "./logInteraction";

export async function endBrowserSession(sessionId: string, user: IUserORM){
    const updatedSession = await BrowserSession.findByIdAndUpdate(
        sessionId,
        {
          endedTimestamp: Date.now(),
        },
        { new: true }
      );
      await logInteraction(user, sessionId, InteractionType.UserEndsBrowserSession, {
        sessionId: updatedSession._id,
        endedTimestamp: updatedSession.endedTimestamp,
      });
      console.log(
        `User ${user.alias} Ended a session: ${updatedSession._id}. Timestamp: ${updatedSession.endedTimestamp}`
      );
}