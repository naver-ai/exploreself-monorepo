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

  // const narrative_eng = `
  // Ever since middle school, I've always seen myself as someone who thrives in the shadows, away from the glaring spotlight of public attention. 
  // I preferred to keep my head down, diligently working in quiet solitude, and my social interactions were always subtle, never the center of attention. 
  // But recently, my usual tranquility at work was disrupted when I was unexpectedly chosen to lead a major project. 
  // This wasn't just any project; it involved a division-wide presentation, thrusting me into the very spotlight I had always avoided. 
  // The thought of standing in front of all those people, having to lead and direct, filled me with an intense dread that was completely new to me. 
  // `

  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // })

  const themes = await generateThemesFromContext(self_narrative, history_log);

  // console.log("EDGES: ", initial_edges.themes)

  // const answerCallback = createAnswerCallback(rl, themes.themes, self_narrative)

  // rl.question('What theme would you like to explore?\n(Select by index): ',answerCallback)

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