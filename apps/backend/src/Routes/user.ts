import express from 'express';
import { User } from "../config/schema";
import { signedInUserMiddleware } from './middlewares';
import type {RequestWithUser} from './middlewares'

var router = express.Router()

// TODO: Check if uid should be wrapped by ObjectId
const setInitialNarrative = async (req: RequestWithUser, res) => {
  const init_narrative = req.body.init_narrative;
  console.log(req.user)
  const uid = req.user._id
  try {
    const updatedUser = await User.findByIdAndUpdate(uid, {$set: {initial_narrative: init_narrative}})
    res.json({
      success: true
    })
  } catch (err) {
    res.json({
      success: false,
      err: err.message
    })
  }

}

const setValueSet = async (req: RequestWithUser, res) => {
  const value_set = req.body.value_set;
  const uid = req.user._id
  User.findByIdAndUpdate(uid, {$set: {value_set: value_set}}, (err, data) => {
    if (err) throw err;
    else {
      res.json({
        success: true
      })
    }
  })
}

const setBackground = async (req: RequestWithUser, res) => {
  const background = req.body.background;
  const uid = req.user._id
  User.findByIdAndUpdate(uid, {$set: {background: background}}, (err, data) => {
    if (err) throw err;
    else {
      res.json({
        success: true
      })
    }
  })
}
router.get('/', signedInUserMiddleware, async (req: RequestWithUser, res) => {
  res.json({
    user: req.user.toJSON()
  })
});

router.post('/setInitialNarrative', signedInUserMiddleware, setInitialNarrative)
router.post('/setValueSet', signedInUserMiddleware, setValueSet)
router.post('/setBackground', signedInUserMiddleware, setBackground)


export default router;

