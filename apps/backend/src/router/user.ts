import express from 'express';
import { QASet, ThreadItem, User } from "../config/schema";
import { signedInUserMiddleware } from './middlewares';
import type {RequestWithUser} from './middlewares'
import { body } from 'express-validator';
import { InteractionType, SessionStatus } from '@core';
import { logInteraction } from '../utils/logInteraction';

const router = express.Router()

router.get('/', signedInUserMiddleware, async (req: RequestWithUser, res) => {
  res.json({
    user: (await req.user.populate({
      path: "threads",
      populate: {
        path: "questions"
      }
    })).toJSON()
  })
});

router.post('/narrative', signedInUserMiddleware, body("init_narrative").exists().trim(), async (req: RequestWithUser, res) => {
  const init_narrative = req.body.init_narrative;
  const uid = req.user._id
  const updatedUser = await User.findByIdAndUpdate(uid, {$set: {initialNarrative: init_narrative}}, {new: true})
  res.json({
    initialNarrative: updatedUser.initialNarrative
  })
})


router.post('/profile', signedInUserMiddleware, body("name").exists().trim(), async (req: RequestWithUser, res) => {
  const name = req.body.name;
  const uid = req.user._id
  const updatedUser = await User.findByIdAndUpdate(uid, {$set: { name }}, {new: true})
  console.log('Update User: ', updatedUser)
  res.json({
    name: updatedUser.name
  })
})

router.post('/debriefing', signedInUserMiddleware, body("debriefing").exists().trim(), async (req: RequestWithUser, res) => {
  const debriefing = req.body.debriefing;
  req.user.debriefing = debriefing
  await req.user.save()
  res.json({
    debriefing: req.user.debriefing
  })
})

router.put("/status", signedInUserMiddleware, body("status").exists().isIn(Object.keys(SessionStatus)), async (req: RequestWithUser, res) => {
  const newStatus = req.body.status
  const oldStatus = req.user.sessionStatus
  if(oldStatus != newStatus){
    req.user.sessionStatus = newStatus
    await req.user.save()

    await logInteraction(req.user, InteractionType.UserChangeSessionStatus, {from: oldStatus, to: newStatus}, undefined, Date.now())
  }

  res.json({
    sessionStatus: req.user.sessionStatus
  })
})

router.post("/terminate", signedInUserMiddleware, body("debriefing").optional().isString().trim(), async (req: RequestWithUser, res) => {
  const timestamp = Date.now()
  
  const debriefing = req.body.debriefing;
  if(req.body.debriefing !== undefined){
    req.user.debriefing = debriefing
  }

  req.user.sessionStatus = SessionStatus.Terminated
  
  await req.user.save()

  await logInteraction(req.user, InteractionType.UserTerminateExploration, {debriefing: req.user.debriefing}, undefined, timestamp)

  res.json({
    debriefing: req.user.debriefing,
    sessionStatus: req.user.sessionStatus
  })
})

router.delete("/reset", signedInUserMiddleware, async (req: RequestWithUser, res) => {
  

  console.log(`Reset user narrative data of user ${req.user._id}`)

  const {deletedCount: deletedQACount} = await QASet.deleteMany({tid: {$in: req.user.threads}})
  const {deletedCount: deletedThreadCount} = await ThreadItem.deleteMany({uid: req.user._id})

  console.log(`Deleted ${deletedQACount} QASets, ${deletedThreadCount} threads.`)
  req.user.initialNarrative = null
  req.user.threads = []
  req.user.pinnedThemes = []
  req.user.synthesis = []
  req.user.debriefing = undefined
  req.user.sessionStatus = SessionStatus.Exploring
  await req.user.save()

  const updatedUser = await req.user.populate({
    path: "threads",
    populate: {
      path: "questions"
    }
  })

  res.json({
    deletedQACount,
    deletedThreadCount,
    updatedUser
  })
})

export default router;

