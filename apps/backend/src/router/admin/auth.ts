import express, { Request, Response } from "express"
import { AdminUser, IAdminUserORM, IUserORM, User } from "../../config/schema"
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { signedInAdminUserMiddleware } from "./middleware"

const router = express.Router()

const createPasscodeValidation = () => body("passcode").trim().notEmpty().isAlphanumeric()

function makeUserToken(adminUser: IAdminUserORM): string {
    return jwt.sign({
        sub: adminUser._id.toString(),
        iat: Date.now()/1000,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year expiration
    }, process.env.AUTH_SECRET, {algorithm: 'HS256'})
}

router.post('/login', createPasscodeValidation(), async (req: Request, res: Response) => {
    const vErrors = validationResult(req)
    console.log("V: ", vErrors)

    if(vErrors.isEmpty()){
        try {
            const passcode = req.body.passcode
            console.log('find user with passcode - ', passcode)
            let user = await AdminUser.findOne({ passcode });
            console.log(user)
            if (user) {  
              res.status(200).send({ token: makeUserToken(user), user: user.toJSON() })
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
      console.log("Sign in error - ", vErrors.array())
        res.status(500).send({errors: vErrors.array()})
    }
  });

router.get("/verify", signedInAdminUserMiddleware, (req, res) => {
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
        res.status(200).send({ token: makeUserToken(savedUser), user: newUser.toJSON() })
    }else{
        res.status(500).send({errors: vErrors.array()})
    }
})

export default router;

