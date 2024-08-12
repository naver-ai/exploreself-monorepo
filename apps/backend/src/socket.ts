import socketIO, { Socket } from 'socket.io'
import jwt from 'jsonwebtoken';
import { User } from './config/schema';
import { endBrowserSession } from './utils/browserSession';
import { SocketEvents } from '@core';

let io: socketIO.Server = undefined


export function initSocket(server, corsOrigins?: Array<string>){
    io = new socketIO.Server(server, {cors: {
        origin: corsOrigins
    }})
    io.use(async (socket, next) => {
        const mode: "admin" | "user" = socket.handshake.auth.mode
        const token = socket.handshake.auth.token

        if(!token){
            return next(new Error('Authentication error: No token provided'));
        }else{
            const decoded = jwt.verify(token, process.env.AUTH_SECRET)
            switch(mode){
            case "admin":
                if(decoded.sub == process.env['ADMIN_ID']){
                    return next()
                }
                break;
            case "user":
                try{
                    let user = await User.findById(decoded.sub);
                    if(user != null){
                        socket.handshake.auth.user = user
                        return next()
                    }
                }catch(ex){
                    console.log(ex)
                }
                break;
            }

            return next(new Error('Authentication failed: Wrong authorization token.'))
        }
    })

    const adminSockets: {[key:string]: Socket} = {}

    io.on("connection", (socket) => {
        const mode = socket.handshake.auth.mode
        console.log(mode, "user connected. Socket id:", socket.id)
        switch(mode){
            case "admin":
                adminSockets[socket.id] = socket
                socket.on("disconnect", () => {
                    console.log("Admin user disconnected. Socket id:", socket.id)
                    adminSockets[socket.id] = undefined
                })
                break;
            case "user":
                const browserSessionId: string = socket.handshake.auth.browserSessionId
                
                socket.on("disconnect", () => {
                    console.log("User disconnected. Socket id:", socket.id)
                    endBrowserSession(browserSessionId, socket.handshake.auth.user).then()
                })

                socket.on(SocketEvents.OnScreenRecordingEvent, (recordingEventElement) => {
                    Object.keys(adminSockets).forEach(adminSocketId => {
                        const adminSocket = adminSockets[adminSocketId]
                        if(adminSocket != null){
                            adminSocket.emit(SocketEvents.OnScreenRecordingEvent, {
                                browserSessionId,
                                event: recordingEventElement
                            })
                        }
                    })
                })
                break;
        }
    })
}