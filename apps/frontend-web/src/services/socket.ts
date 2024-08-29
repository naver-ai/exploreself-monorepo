
import io, { Socket } from 'socket.io-client';
import { Http } from '../net/http';

console.log()
export const socket = io(`${import.meta.env.DEV ? 'http://0.0.0.0' : import.meta.env.VITE_BACKEND_HOSTNAME}:${import.meta.env.VITE_BACKEND_PORT}`, {
    autoConnect: false
})