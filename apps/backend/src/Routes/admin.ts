import express from 'express';
import { User } from "../config/schema"
var router = express.Router()


const loginHandler = async (req, res) => {
  try {
    const ucode = req.body.ucode;
    const name = req.body.name;
    const isKorean = req.body.isKorean
    let user = await User.findOne({ name: name, ucode: ucode});
    if (user) {
      res.json({
        success: true,
        new: false,
        user: user
      });
    } else {
      const newUser = new User({ 
        name: name, 
        ucode: ucode,
        isKorean: isKorean,
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

router.post('/login', loginHandler);

export default router;

