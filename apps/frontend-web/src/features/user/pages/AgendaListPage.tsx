import { useDispatch, useSelector } from "../../../redux/hooks"
import { useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate } from "react-router-dom"
import { agendaSelectors } from "../reducer"
import { Button } from "antd"
import { loadAgenda } from "../../agenda/reducer"

const AgendaView = (props: {agendaId: string}) => {

    const agenda = useSelector(state => agendaSelectors.selectById(state, props.agendaId))

    const dispatch = useDispatch()

    const navigate = useNavigate()

    const onClick = useCallback(async ()=>{
        console.log(props.agendaId)
        navigate("./" + props.agendaId)
    }, [props.agendaId])

    return <div className="card-button-wrapper" onClick={onClick}>
        <div className="select-none font-semibold">{agenda.title}</div>
        <div className="select-none mt-2 text-sm text-slate-400">{agenda.initialNarrative}</div>
    </div>
}

export const AgendaListPage  = () => {

    const [t] = useTranslation()

    const navigate = useNavigate()

    const userName = useSelector(state => state.user.name)

    const agendaIds = useSelector(state => state.user.agendaEntityState.ids)

    const onNewAgendaClick = useCallback(()=>{
        navigate("new")
    }, [])
    
    useEffect(()=>{
        
    }, [])
    
    if (userName == null || userName.length == 0) {
        return <Navigate to="/app/profile" />;
      } else return <div className="container h-full px-4">
        <h1>{t("Agendas.Title")}</h1>
        <div className="grid grid-cols-1 gap-4">
            <Button type="primary" size="large" onClick={onNewAgendaClick}>
                <div className="select-none">{t("Agendas.New")}</div>
            </Button>
            {
                agendaIds.map(id => <AgendaView key={id} agendaId={id}/>)
            }
        </div>
    </div>
}