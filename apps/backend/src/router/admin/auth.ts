import express, { Request, Response } from "express"
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { signedInAdminUserMiddleware } from "./middleware"
import bcrypt from 'bcrypt'
import path from "path"
import dotenv from 'dotenv'

const router = express.Router()

const createPasswordValidation = () => body("password").trim().notEmpty()

function makeUserToken(): string {
    return jwt.sign({
        sub: process.env["ADMIN_ID"],
        iat: Date.now()/1000,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year expiration
    }, process.env.AUTH_SECRET, {algorithm: 'HS256'})
}

const envPath = path.resolve(process.cwd(), ".env")

router.post('/login', createPasswordValidation(), async (req: Request, res: Response) => {
    const vErrors = validationResult(req)

    if(vErrors.isEmpty()){
        try {
            const password = req.body.password
            const env = dotenv.config({path: envPath})?.parsed || {}
            
            const passwordMatches = await bcrypt.compare(password, env.ADMIN_HASHED_PW)
            console.log(passwordMatches)
            if (passwordMatches) {  
              res.status(200).send({ token: makeUserToken() })
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

export default router;

