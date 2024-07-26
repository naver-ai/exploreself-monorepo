import express, { Request, Response } from "express"
import { IUserORM, User } from "../config/schema"
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { signedInUserMiddleware } from "./middlewares"

const router = express.Router()

const createPasscodeValidation = () => body("passcode").trim().notEmpty().isAlphanumeric()

function makeUserToken(user: IUserORM): string {
    return jwt.sign({
        sub: user._id.toString(),
        iat: Date.now()/1000,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year expiration
    }, process.env.AUTH_SECRET, {algorithm: 'HS256'})
}

router.post('/login', createPasscodeValidation(), async (req: Request, res: Response) => {
    const vErrors = validationResult(req)

    if(vErrors.isEmpty()){
        try {
            const passcode = req.body.passcode
            let user = await User.findOne({ passcode });
            if (user) {  
              res.status(200).send({ token: makeUserToken(user), user })
            } else {
              res.status(400).send("WrongCredential")
            }
          } catch (err) {
            console.log("ERR: ", err.message)
            res.json({
              err: err.message
            });
          }
    }else{
        res.status(500).send({errors: vErrors.array()})
    }
  });

router.get("/verify", signedInUserMiddleware, (req, res) => {
  res.status(200).send(true)
})

router.post("/register", createPasscodeValidation(), 
    body("alias").trim().notEmpty(), body("isKorean").isBoolean().exists(), async (req, res) => {
    const vErrors = validationResult(req)
    if(vErrors.isEmpty()){
        const passcode = req.body.passcode
        const alias = req.body.alias
        const isKorean = req.body.isKorean
        const newUser = new User({ 
          alias,
          passcode,
          isKorean
        });
        const savedUser = await newUser.save();
        console.log("SAVED: ", savedUser)
        res.status(200).send({ token: makeUserToken(savedUser), user: newUser })
    }else{
        res.status(500).send({errors: vErrors.array()})
    }
})

export default router;

