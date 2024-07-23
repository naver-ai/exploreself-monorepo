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
      console.log("NEW USER")
      const newUser = new User({ 
        name: name, 
        ucode: ucode,
        initial_narrative: 'initial_narrative',
        background: 'initial_background',
        threadRef: []
      }); 
      const savedUser = await newUser.save();
      console.log("SAVED: ", savedUser)
      res.json({
        success: true,
        new: true,
        user: savedUser
      });
    }
  } catch (err) {
    console.log("ERR: ", err.message)
    res.json({
      err: err.message
    });
  }
};

export default loginHandler;