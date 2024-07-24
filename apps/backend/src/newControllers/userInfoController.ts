import { Request, Response } from "express";
import { User } from "../config/schema";
import { undefined } from "zod";

const getUserInfo = async (req: Request, res: Response) => {
  const uid = req.body.uid
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }
  res.json({
    user: user
  })
}

// TODO: Check if uid should be wrapped by ObjectId
const setInitialNarrative = async (req: Request, res: Response) => {
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

const setValueSet = async (req: Request, res: Response) => {
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

const setBackground = async (req: Request, res: Response) => {
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

export {getUserInfo, setInitialNarrative, setValueSet, setBackground}