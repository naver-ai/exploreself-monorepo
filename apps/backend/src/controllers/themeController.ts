import { Request, Response } from 'express';
import generateThemesFromContext from '../utils/questionChain/generateThemes';
import readline from 'readline'
import { User, Theme } from '../config/schema';
import { ObjectId } from 'mongodb';
import { uid } from '../config/config';
import { processHistory } from '../utils/helperFunc';
import { Model } from 'mongoose';
// const readline = require("readline")

const generateThemes = async (req: Request, res: Response) => {
  // const narrative = req.body.narrative;

  const user = await User.findById(new ObjectId(uid));
  
  if (!user) {
    res.status(400).send('User not found');
  }

  const history = user.history;
  const self_narrative = user.selfNarrative;

  const history_log = await processHistory(history, res)

  const themes = await generateThemesFromContext(self_narrative, history_log);

  res.json(themes)
}

const saveTheme = async (req: Request, res: Response) => {

  const themeContent = req.body.themeContent;

  const newTheme = new Theme({
    user: new ObjectId(uid), 
    repContent: themeContent, 
    saved: true, 
    activated: false
  })

  newTheme.save()
    .then(savedTheme => {
      console.log("Theme saved: ", savedTheme)
      res.json({success: true})
    })
    .catch(err => {
      console.log("Error saving theme: ", err)
      res.json({success: false})
    }) 

}

const activateTheme = (req: Request, res: Response) => {
  const themeId = req.body.themeId;
  Theme.findByIdAndUpdate(themeId, {$set: {activated: true}},(err, data) => {
    if (err) throw err;
    else{
      res.json({success: true})
    }
  })
}

const deActivateTheme = async (req:Request, res: Response) => {
  const themeId = req.body.themeId;
  Theme.findByIdAndUpdate(themeId, {$set: {activated: true}},(err, data) => {
    if (err) throw err;
    else{
      res.json({success: true})
    }
  })
}

export {generateThemes, saveTheme, activateTheme, deActivateTheme}