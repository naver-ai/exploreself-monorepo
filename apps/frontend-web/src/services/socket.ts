
import io, { Socket } from 'socket.io-client';
import { Http } from '../net/http';

console.log(Http.axios.defaults.baseURL!, import.meta)
export const socket = io(`${import.meta.env.VITE_BACKEND_HOSTNAME}:${import.meta.env.VITE_BACKEND_PORT}`, {
    autoConnect: false
})