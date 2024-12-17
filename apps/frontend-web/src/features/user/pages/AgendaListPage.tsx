import { useSelector } from "../../../redux/hooks"
import { useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate } from "react-router-dom"

export const AgendaListPage  = () => {

    const [t] = useTranslation()

    const navigate = useNavigate()

    const userName = useSelector(state => state.user.name)

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
            <div className="card-button-wrapper" onClick={onNewAgendaClick}>
                <div className="select-none">{t("Agendas.New")}</div>
            </div>
            {
                
            }
        </div>
    </div>
}