import express from 'express';
import { User } from '../config/schema';
import generateThemesFromNarrative from '../Utils/old/generateThemesFromNarrative'
import generateThemesFromRecentResponse from '../Utils/old/generateThemesFromRecentResponse'
import { IInitInfo } from '../config/interface';
import generateThemes from '../Utils/generateThemes';
import { RequestWithUser } from './middlewares';

var router = express.Router()

const generateThemesHandler = async (req: RequestWithUser, res) => {
  const user = req.user;
  const uid = user._id
  try {
    const themes = await generateThemes(uid)
    res.json({
      themes: themes
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
  

}
const generateInitialThemes = async (req: RequestWithUser, res) => {
  const user = req.user
  const basicInfo: IInitInfo = {
    init_nar: user.initial_narrative,
    val_set: user.value_set,
    background: user.background
  }
  const themes = await generateThemesFromNarrative(basicInfo);

  res.json({
    themes: themes
  })
}

const generateThemesFromResp = async (req, res) => {
  const uid = req.body.uid
  
  try {
    const themes = await generateThemesFromRecentResponse(uid);
    console.log("THEMES: ", themes)
    res.json({
      themes: themes
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
  
}

router.post('/generateInitialThemes', generateInitialThemes);
router.post('/generateThemesFromResp', generateThemesFromResp)
router.post('/getThemes', generateThemesHandler)

export default router;