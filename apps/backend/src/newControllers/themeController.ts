import { Request, Response } from 'express';
import { User } from '../config/schema';
import generateThemesFromNarrative from '../newUtils/generateThemesFromNarrative'
import generateThemesFromRecentResponse from '../newUtils/generateThemesFromRecentResponse'
import { IInitInfo } from '../config/interface';

const generateInitialThemes = async (req: Request, res: Response) => {
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

const generateThemesFromResp = async (req: Request, res: Response) => {
  const uid = req.body.uid
  
  try {
    const themes = await generateThemesFromNarrative(uid);
    res.json({
      themes: themes
    })
  } catch (err) {
    res.json({
      err: err.message
    })
  }
  
}
export {generateInitialThemes, generateThemesFromResp}