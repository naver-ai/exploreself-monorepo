import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useAgendaIdInRoute } from "../hooks"
import { useDispatch } from "../../../redux/hooks"
import { loadAgenda } from "../reducer"
export const AgendaRoute = () => {
    
    const agendaId = useAgendaIdInRoute()

    const dispatch = useDispatch()

    useEffect(()=>{
        if(agendaId!= null){
            dispatch(loadAgenda(agendaId))
        }
    }, [agendaId])
    
    if(agendaId != null){
        return <Outlet/>
    }else{
        return null
    }
}