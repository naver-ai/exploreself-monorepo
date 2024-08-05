import express from 'express';
import { QASet, ThreadItem, User } from "../config/schema";
import { signedInUserMiddleware } from './middlewares';
import type {RequestWithUser} from './middlewares'
import { body } from 'express-validator';

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

router.delete("/reset", signedInUserMiddleware, async (req: RequestWithUser, res) => {
  

  console.log(`Reset user narrative data of user ${req.user._id}`)

  const {deletedCount: deletedQACount} = await QASet.deleteMany({tid: {$in: req.user.threads}})
  const {deletedCount: deletedThreadCount} = await ThreadItem.deleteMany({uid: req.user._id})

  console.log(`Deleted ${deletedQACount} QASets, ${deletedThreadCount} threads.`)
  req.user.initialNarrative = null
  req.user.threads = []
  req.user.pinnedThemes = []
  req.user.synthesis = []
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

