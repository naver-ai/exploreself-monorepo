import { useMatch } from "react-router-dom";

export function useAgendaIdInRoute(): string | undefined {
    const match = useMatch('/app/agendas/:agenda_id/*')
    return match?.params?.agenda_id
}