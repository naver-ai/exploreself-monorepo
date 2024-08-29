import express, { Request, Response } from "express"
import { User } from "../../config/schema"
import { createReadStream, exists, readFile, readJson } from "fs-extra"
import { getBrowserSessionFilePath } from "../user"
import {Types} from 'mongoose'
import { param } from "express-validator"
import { populate } from "dotenv"

const router = express.Router()

router.get("/all", async (req, res) => {
      try {
        const userList = await User.find()
        console.log("ULIST: ", userList)
        res.json({
          userList: userList
        })
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    })

router.post("/new", async (req, res) => {
      try {
        const userInfo: {passcode?: string, alias: string, isKorean: boolean} = req.body.userInfo
        console.log("user info: ", userInfo)
        const newUser = await new User({
          passcode: userInfo.passcode,
          alias: userInfo.alias,
          isKorean: userInfo.isKorean
        }).save()

        console.log(newUser)

        res.json({
          user: newUser
        })
      } catch (err) {
        res.status(500).json({message: err.message})
      }
    })

router.get("/:userId/browser_sessions/all", param("userId").trim().exists(), async (req, res) => {
    const userId = req.params.userId
    const user = await (await User.findById(userId)).populate({
      path: "browserSessions", populate: "interactionLogs"
    })
    res.json(user)
})

router.get("/:userId/browser_sessions/:sessionId", async (req, res) => {
    const userId = req.params.userId
    const sessionId = req.params.sessionId

    const sessionRecordingPath = getBrowserSessionFilePath(userId, sessionId)
    if(await exists(sessionRecordingPath)){
        res.json({"eventsJsonLines": await readFile(sessionRecordingPath, {encoding: 'utf8'})})
    }else{
        res.status(404).json({message: "Session log file does not exist."})
    }
})

export default router