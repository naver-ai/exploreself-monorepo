import express from 'express';
import { User } from "../config/schema";
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

export default router;

