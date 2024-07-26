import express from 'express';
import { User } from '../config/schema';
import generateThemesFromNarrative from '../newUtils/generateThemesFromNarrative'
import generateThemesFromRecentResponse from '../newUtils/generateThemesFromRecentResponse'
import { IInitInfo } from '../config/interface';

var router = express.Router()


const generateInitialThemes = async (req, res) => {
  const uid = req.body.uid
  const user = await User.findById(uid);
  if (!user) {
    res.status(400).send('User not found');
  }
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

export default router;