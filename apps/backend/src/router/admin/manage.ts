import express from 'express';
import { body } from 'express-validator';
import { RequestWithAdminUser, signedInAdminUserMiddleware } from './middleware';
import { User } from '../../config/schema';

const router = express.Router();


const getUserList = async (req: RequestWithAdminUser, res) => {
  try {
    const userList = await User.find()
    console.log("ULIST: ", userList)
    res.json({
      userList: userList
    })
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req: RequestWithAdminUser, res) => {
  try {
    const userInfo: {passcode: string, alias: string} = req.body.userInfo
    const newUser = await new User({
      passcode: userInfo.passcode,
      alias: userInfo.alias
    }).save()
    res.json({
      user: newUser
    })
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

router.get('/users', signedInAdminUserMiddleware, getUserList)
router.post('/user', signedInAdminUserMiddleware, createUser)

export default router;
