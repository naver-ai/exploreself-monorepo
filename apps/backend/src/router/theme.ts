import express from 'express';
import { User } from '../config/schema';
import { signedInUserMiddleware } from './middlewares';
import type { RequestWithUser } from './middlewares';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/pin',
  signedInUserMiddleware,
  body('theme').exists().trim(),
  async (req: RequestWithUser, res) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { pinnedThemes: req.body.theme } },
      { new: true }
    );
    res.json({
      pinnedThemes: updatedUser.pinnedThemes,
    });
  }
);

router.post(
  '/unpin',
  signedInUserMiddleware,
  body('theme').exists().trim(),
  body("intentional").exists().isBoolean().toBoolean(),
  async (req: RequestWithUser, res) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { pinnedThemes: req.body.theme } },
      { new: true }
    );

    if(req.body.intentional){
        //This is the case when the user unpinned a theme deliberately.
    }else{
        //This is the case when the system unpinned a theme; such as when generating a thread from the theme.
    }

    res.json({
      pinnedThemes: updatedUser.pinnedThemes,
    });
  }
);

export default router;
