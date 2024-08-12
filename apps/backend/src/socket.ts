import socketIO, { Socket } from 'socket.io'
import jwt from 'jsonwebtoken';
import { User } from './config/schema';

let io: socketIO.Server = undefined

function getMode(socket: Socket): "admin" | "user" {
    return socket.handshake.url.includes("/admin") ? "admin" : "user"
}

export function initSocket(server){
    io = new socketIO.Server(server)
    io.use(async (socket, next) => {
    const mode: "admin" | "user" = getMode(socket)
    const token = socket.handshake.auth.token
    console.log("WebSocket handshake. Mode:", mode, "Token:", token)

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
            let user = await User.findById(decoded.sub);
            if(user != null){
                return next()
            }
            break;
        }
        return next(new Error('Authentication failed: Wrong authorization token.'))
    }
    })

    io.on("connection", (socket) => {
        const mode = getMode(socket)
        console.log(mode, "user connected. Socket id:", socket.id)
        switch(mode){
            case "admin":
                socket.on("disconnect", () => {
                    console.log("Admin user disconnected. Socket id:", socket.id)
                })
                break;
            case "user":
                break;
        }
    })
}