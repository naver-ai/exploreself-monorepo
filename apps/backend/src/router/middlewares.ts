import { Request, Response } from 'express'
import { AgendaItem, IAgendaORM, IThreadORM, IUserORM, ThreadItem, User } from '../config/schema'
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

export type RequestWithAgenda = RequestWithUser & { agenda: IAgendaORM }

export const assertAgendaIdParamMiddleware = async (req: RequestWithUser, res: Response, next) => {
    signedInUserMiddleware(req, res, async () => {
        try {
            if(req.params.aid){
                const agenda = await AgendaItem.findOne({uid: req.user._id, _id: req.params.aid})
                if(agenda != null){
                    req["agenda"] = agenda
                    next()
                }else throw "WrongAgendaId"
            } else{
                next()
            }
        } catch (err) {
            res.status(400).send("No valid agenda ID provided: " + err)
        }
    })
}

export type RequestWithTheme = RequestWithAgenda & {theme: IThreadORM}

export const assertThemeIdParamMiddleward = async (req: RequestWithAgenda, res: Response, next) => {
    assertAgendaIdParamMiddleware(req, res, async () => {
        try{
            if(req.params.tid){
                const theme = await ThreadItem.findOne({aid: req.agenda._id, _id: req.params.tid})
                if(theme != null){
                    req["theme"] = theme
                    next()
                }else throw "WrongThemeId"
            }else{
                next()
            }
        }catch (err) {
            res.status(400).send("No valid theme ID provided: " + err)
        }
    })
}