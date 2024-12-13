import express from 'express';
import {
  BrowserSession,
  BrowserSessionSchema,
  IUserORM,
  QASet,
  ThreadItem,
  User,
} from '../config/schema';
import { signedInUserMiddleware } from './middlewares';
import type { RequestWithUser } from './middlewares';
import { body, ExpressValidator } from 'express-validator';
import { IDidTutorial, InteractionType, SessionStatus } from '@core';
import { logInteraction } from '../utils/logInteraction';
import path from 'path';
import { appendFile, appendFileSync, ensureDirSync } from 'fs-extra';
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
      await req.user.populate({
        path: 'threads',
        populate: {
          path: 'questions',
        },
      })
    ).toJSON(),
  });
});

router.post(
  '/narrative',
  signedInUserMiddleware,
  body('init_narrative').exists().trim(),
  async (req: RequestWithUser, res) => {
    const init_narrative = req.body.init_narrative;
    const uid = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: { initialNarrative: init_narrative } },
      { new: true }
    );
    res.json({
      initialNarrative: updatedUser.initialNarrative,
    });
  }
);

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
  '/debriefing',
  signedInUserMiddleware,
  body('debriefing').exists().trim(),
  async (req: RequestWithUser, res) => {
    const debriefing = req.body.debriefing;
    req.user.debriefing = debriefing;
    await req.user.save();
    res.json({
      debriefing: req.user.debriefing,
    });
  }
);

router.put(
  '/status',
  signedInUserMiddleware,
  body('status').exists().isIn(Object.keys(SessionStatus)),
  async (req: RequestWithUser, res) => {
    const newStatus = req.body.status;
    const oldStatus = req.user.sessionStatus;
    if (oldStatus != newStatus) {
      req.user.sessionStatus = newStatus;
      await req.user.save();

      await logInteraction(
        req.user,
        req.browserSessionId,
        InteractionType.UserChangeSessionStatus,
        { from: oldStatus, to: newStatus },
        undefined,
        Date.now()
      );
    }

    res.json({
      sessionStatus: req.user.sessionStatus,
    });
  }
);

router.post(
  '/terminate',
  signedInUserMiddleware,
  body('debriefing').optional().isString().trim(),
  async (req: RequestWithUser, res) => {
    const timestamp = Date.now();

    const debriefing = req.body.debriefing;
    if (req.body.debriefing !== undefined) {
      req.user.debriefing = debriefing;
    }

    req.user.sessionStatus = SessionStatus.Terminated;

    await req.user.save();

    await logInteraction(
      req.user,
      req.browserSessionId,
      InteractionType.UserTerminateExploration,
      { debriefing: req.user.debriefing },
      undefined,
      timestamp
    );

    res.json({
      debriefing: req.user.debriefing,
      sessionStatus: req.user.sessionStatus,
    });
  }
);

router.post(
  '/revert_terminate',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const timestamp = Date.now();

    req.user.sessionStatus = SessionStatus.Reviewing;

    await req.user.save();

    await logInteraction(
      req.user,
      req.browserSessionId,
      InteractionType.UserRevertTermination,
      {},
      undefined,
      timestamp
    );
    res.json({
      sessionStatus: req.user.sessionStatus,
    });
  }
);

router.delete(
  '/reset',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    console.log(`Reset user narrative data of user ${req.user._id}`);

    const { deletedCount: deletedQACount } = await QASet.deleteMany({
      tid: { $in: req.user.threads },
    });
    const { deletedCount: deletedThreadCount } = await ThreadItem.deleteMany({
      uid: req.user._id,
    });

    console.log(
      `Deleted ${deletedQACount} QASets, ${deletedThreadCount} threads.`
    );
    req.user.initialNarrative = null;
    req.user.threads = [];
    req.user.pinnedThemes = [];
    req.user.summaries = [];
    req.user.debriefing = undefined;
    req.user.sessionStatus = SessionStatus.Exploring;

    await req.user.save();

    const updatedUser = await req.user.populate({
      path: 'threads',
      populate: {
        path: 'questions',
      },
    });

    res.json({
      deletedQACount,
      deletedThreadCount,
      updatedUser,
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
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(400);
      console.error(err)
    }
  }
);

export default router;
