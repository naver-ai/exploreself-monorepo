import { Request, Response } from 'express'
import { expressjwt, Request as JWTRequest } from 'express-jwt'
import mongoose from 'mongoose'
import { AdminUser, IAdminUserORM } from '../../config/schema'


export type RequestWithUser = JWTRequest & { adminUser: IAdminUserORM }

export const signedInAdminUserMiddleware = [expressjwt({
        secret: process.env.AUTH_SECRET,
        algorithms: ["HS256"]
    }), async (req: JWTRequest, res: Response, next) => {
        if(req.auth){
            let user = await AdminUser.findById(req.auth.sub);
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