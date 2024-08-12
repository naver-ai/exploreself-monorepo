import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import io, {Socket} from 'socket.io-client';

export const AdminSignedInRouteFrame = () => {
    const socketRef = useRef<Socket>(null)

    useEffect(()=>{
        
    }, [])

    return <Outlet/>
}