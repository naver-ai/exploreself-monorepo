import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from '../../redux/hooks';
import { Http } from '../../net/http';
import { socket } from '../../services/socket';

export const AdminSignedInRouteFrame = () => {

    const token = useSelector(state=> state.admin.auth.token)

    useEffect(()=>{
        socket.auth = {
            token,
            mode: 'admin'
        }

        socket.on('connect', ()=>{

            console.log("Admin connected to websocket.")
        })

        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [token])

    return <Outlet/>
}