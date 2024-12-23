import { useDispatch, useSelector } from "../../../redux/hooks"
import { useCallback, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate } from "react-router-dom"
import { agendaSelectors } from "../reducer"
import { Button } from "antd"
import LinesEllipsis from 'react-lines-ellipsis'

import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC'
import moment from "moment"
const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis)


const AgendaView = (props: {agendaId: string}) => {

    const agenda = useSelector(state => agendaSelectors.selectById(state, props.agendaId))

    const createdAtLabel = useMemo(()=>{
        return moment(agenda.createdAt).locale('es').format('lll')
    }, [agenda.createdAt])

    const [t] = useTranslation()

    const navigate = useNavigate()

    const onClick = useCallback(async ()=>{
        console.log(props.agendaId)
        navigate("./" + props.agendaId)
    }, [props.agendaId])

    return <div className="card-button-wrapper" onClick={onClick}>
        <div className="flex justify-between items-baseline">
            <div className="select-none font-semibold">{agenda.title}</div>
            <div className="select-none text-slate-400 text-sm">{createdAtLabel}</div>
        </div>
        <ResponsiveEllipsis maxLine={1} trimRight basedOn="letters" className="select-none mt-3 text-sm text-slate-400" text={agenda.initialNarrative}/>
        <div className="mt-4 px-.5">
            <div className="text-xs font-semibold text-slate-400">{t("Agendas.ThemeCount", {count: agenda.threads.length})}</div>
        </div>
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
      } else return <div className="h-full overflow-y-auto"><div className="container px-4">
        <h1>{t("Agendas.Title")}</h1>
        <div className="grid grid-cols-1 gap-4 mb-8">
            <Button type="primary" size="large" onClick={onNewAgendaClick}>
                <div className="select-none">{t("Agendas.New")}</div>
            </Button>
            {
                agendaIds.map(id => <AgendaView key={id} agendaId={id}/>)
            }
        </div>
    </div></div>
}

export default AgendaListPage