import { Request, Response } from 'express'
import { IUserORM, User } from '../config/schema'
import jwt from 'jsonwebtoken'

export type RequestWithUser = Request & { user: IUserORM, browserSessionId: string | undefined, localTimezone: string | undefined }

export const signedInUserMiddleware =  async (req: Request, res: Response, next) => {
        if(req.headers.authorization){
            const token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.AUTH_SECRET)
            let user = await User.findById(decoded.sub);
            if (user) {  

                req["user"] = user

                req["browserSessionId"] = req.headers["x-browser-session-id"]
                req["localTimezone"] = req.headers["x-timezone"]

                next()
            } else {
              res.status(400).send("WrongCredential")
            }
        }else{
            res.status(400).send("No auth header provided.")
        }
    }