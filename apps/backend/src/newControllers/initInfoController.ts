import { Request, Response } from "express";
import { uid } from "../config/config";
import { User } from "../config/schema";

// TODO: Check if uid should be wrapped by ObjectId
const setInitialNarrative = (req: Request, res: Response) => {
  const init_narrative = req.body.init_narrative;
  User.findByIdAndUpdate(uid, {$set: {initial_narrative: init_narrative}}, (err, data) => {
    if (err) throw err;
    else {
      res.json({
        success: true
      })
    }
  })
}

const setValueSet = (req: Request, res: Response) => {
  const value_set = req.body.value_set;
  User.findByIdAndUpdate(uid, {$set: {value_set: value_set}}, (err, data) => {
    if (err) throw err;
    else {
      res.json({
        success: true
      })
    }
  })
}

const setBackground = (req: Request, res: Response) => {
  const background = req.body.background;
  User.findByIdAndUpdate(uid, {$set: {background: background}}, (err, data) => {
    if (err) throw err;
    else {
      res.json({
        success: true
      })
    }
  })
}

export {setInitialNarrative, setValueSet, setBackground}