import express from 'express';
import {
  BrowserSession,
  QASet,
  ThreadItem,
  User,
} from '../config/schema';
import { signedInUserMiddleware } from './middlewares';
import type { RequestWithUser } from './middlewares';
import { body } from 'express-validator';
import { IDidTutorial, InteractionType, SessionStatus } from '@core';
import { logInteraction } from '../utils/logInteraction';
import path from 'path';
import { appendFileSync, ensureDirSync } from 'fs-extra';
import { Types } from 'mongoose';
import { endBrowserSession } from '../utils/browserSession';

export function getBrowserSessionsDirPath(userId: Types.ObjectId | string): string {
  return path.join(process.cwd(), "storage", userId.toString(), "browser_sessions")
}

export function getBrowserSessionFilePath(userId: Types.ObjectId | string, sessionId: string): string {
  const dirPath = getBrowserSessionsDirPath(userId)
  ensureDirSync(dirPath)
  return path.join(dirPath, `${sessionId}.jsonl`)
}

const router = express.Router();

router.get('/', signedInUserMiddleware, async (req: RequestWithUser, res) => {
  res.json({
    user: (
      await req.user.populate([
        {
          path: 'agendas',
          match: {
            deleted: {
              $ne: true
            }
          }
        }])
    ).toJSON(),
  });
});

router.post(
  '/profile',
  signedInUserMiddleware,
  body('name').exists().trim(),
  async (req: RequestWithUser, res) => {
    const name = req.body.name;
    const uid = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: { name } },
      { new: true }
    );
    console.log('Update User: ', updatedUser);
    res.json({
      name: updatedUser.name,
    });
  }
);

router.post(
  '/browser_sessions/start',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const session = new BrowserSession({
      localTimezone: req.localTimezone
    });
    await session.save();
    req.user.browserSessions.push(session);
    await req.user.save();
    await logInteraction(req.user, session._id.toString(), InteractionType.UserStartsBrowserSession, {
      sessionId: session._id,
      startedTimestamp: session.startedTimestamp,
    });
    console.log(
      `User ${req.user.alias} started a new session: ${session._id}. Timestamp: ${session.startedTimestamp}`
    );
    res.json({
      sessionId: session._id,
    });
  }
);

router.post(
  '/browser_sessions/end',
  signedInUserMiddleware,
  body('sessionId').exists().isString(),
  async (req: RequestWithUser, res) => {
    await endBrowserSession(req.browserSessionId, req.user)
    res.sendStatus(200);
  }
);

router.post(
  '/logs/upload',
  signedInUserMiddleware,
  body('sessionId').exists().isString(),
  body('events').exists(),
  async (req: RequestWithUser, res) => {
    const sessionId = req.body.sessionId
    const events = JSON.parse(req.body.events)

    const filePath = getBrowserSessionFilePath(req.user._id, sessionId)

    appendFileSync(filePath, "\n" + events.map(event => JSON.stringify(event)).join("\n"))
    console.log("Uploaded session recording logs - ", events.length)
    res.sendStatus(200)
  }
);

router.put(
  '/did_tutorial',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const uid = req.user._id;
    const { key, value }: { key: keyof IDidTutorial; value: boolean } = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        uid,
        { $set: { [`didTutorial.${key}`]: value } },
        { new: true }
      );
      console.log("Updated tutorial flag:", updatedUser.didTutorial)
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(400);
      console.error(err)
    }
  }
);

export default router;
