import express from 'express';
import { User } from "../config/schema";
import { RequestWithUser, signedInUserMiddleware } from './middlewares';

var router = express.Router()

// TODO: Check if uid should be wrapped by ObjectId
const setInitialNarrative = async (req, res) => {
  const init_narrative = req.body.init_narrative;
  const uid = req.body.uid
  console.log("UID: ", uid)
  console.log("NAR: ", init_narrative)
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

const setValueSet = async (req, res) => {
  const value_set = req.body.value_set;
  const uid = req.body.uid
  User.findByIdAndUpdate(uid, {$set: {value_set: value_set}}, (err, data) => {
    if (err) throw err;
    else {
      res.json({
        success: true
      })
    }
  })
}

const setBackground = async (req, res) => {
  const background = req.body.background;
  const uid = req.body.uid
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
router.post('/setInitialNarrative', setInitialNarrative)
router.post('/setValueSet', setValueSet)
router.post('setBackground', setBackground)


export default router;

