import { Request, Response } from 'express'
import { IUserORM, User } from '../config/schema'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

export type RequestWithUser = Request & { user: IUserORM, browserSessionId: string | undefined, localTimezone: string | undefined }

export const signedInUserMiddleware =  async (req: Request, res: Response, next) => {
    try {
        if(req.headers.authorization){
            const token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.AUTH_SECRET)
            try {
                if(Types.ObjectId.isValid(decoded.sub)){
                    let user = await User.findById(decoded.sub);
                    if (user) {  
                        req["user"] = user
                        req["browserSessionId"] = req.headers["x-browser-session-id"]
                        req["localTimezone"] = req.headers["x-timezone"]
                        next()
                    }else throw "WrongCredential" 
                }else throw "WrongCredential"
            } catch (err) {
                res.status(400).send("WrongCredential" + err)
            }
        }
    } catch (err) {
        res.status(400).send("No auth header provided: " + err)
    }        
}