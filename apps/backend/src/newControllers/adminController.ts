import { Request, Response } from "express"
import { User } from "../config/schema"

const loginHandler = async (req: Request, res: Response) => {
  try {
    const ucode = req.body.ucode;
    const name = req.body.name;
    let user = await User.findOne({ name: name, ucode: ucode });
    if (user) {
      res.json({
        success: true,
        new: false,
        user: user
      });
    } else {
      const newUser = new User({ name: name, ucode: ucode }); 
      await newUser.save();
      res.json({
        success: true,
        new: true,
        user: newUser
      });
    }
  } catch (err) {
    res.json({
      err: err.message
    });
  }
};

export {loginHandler};