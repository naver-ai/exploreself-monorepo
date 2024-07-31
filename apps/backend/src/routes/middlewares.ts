import { Request, Response } from 'express'
import { expressjwt, Request as JWTRequest } from 'express-jwt'
import { IUserORM, User } from '../config/schema'
import mongoose from 'mongoose'


export type RequestWithUser = JWTRequest & { user: IUserORM }

export const signedInUserMiddleware = [expressjwt({
        secret: process.env.AUTH_SECRET,
        algorithms: ["HS256"]
    }), async (req: JWTRequest, res: Response, next) => {
        if(req.auth){
            let user = await User.findById(req.auth.sub);
            if (user) {  
                req["user"] = user
                next()
            } else {
              res.status(400).send("WrongCredential")
            }
        }else{
            res.status(400).send("No auth header provided.")
        }
    }]