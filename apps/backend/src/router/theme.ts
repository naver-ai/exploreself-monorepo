import express from 'express';
import { User } from '../config/schema';
import generateThemesFromNarrative from '../utils/old/generateThemesFromNarrative'
import generateThemesFromRecentResponse from '../utils/old/generateThemesFromRecentResponse'
import { IInitInfo } from '../config/interface';
import { RequestWithUser } from './middlewares';
import { signedInUserMiddleware } from './middlewares';


var router = express.Router()

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

router.post('/generateInitialThemes', signedInUserMiddleware, generateInitialThemes);
router.post('/generateThemesFromResp', signedInUserMiddleware, generateThemesFromResp)
// The upper APIs are currently deprecated, and will delete in order

export default router;