import { AggregateBox } from "../components/AggregateBox"
import { SummaryPanel } from "../components/SummaryPanel"
import { useSelector } from "../../../redux/hooks"
import { questionSelectors } from "../reducer"
import { useCallback, useRef } from "react"
import Debriefing from "../components/Debriefing"
import { SessionStatus } from "@core"
import { Navigate, useNavigate } from "react-router-dom"
import { useAgendaIdInRoute } from "../hooks"
import { Button } from "antd"
import { ChevronDoubleLeftIcon } from "@heroicons/react/20/solid"

type QuestionRefs = {
  [key: string]: HTMLDivElement | null;
};

export const SummaryPage = () => {

  const navigate = useNavigate()

  const agendaId = useAgendaIdInRoute()

  const title = useSelector(state => state.agenda.title)

  const allQuestions = useSelector((state) => questionSelectors.selectAll(state));
  const filteredQuestions = allQuestions
    .filter(q => q.response && q.response.length > 0)
  const questionRefs = useRef<QuestionRefs>({});
  const scrollToQuestion = (id: string) => {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
  };

  const sessionStatus = useSelector(state => state.agenda.sessionStatus)

  const onReturnClick = useCallback(()=>{
    navigate("/app/agendas")
  }, [])

  if(sessionStatus == SessionStatus.Exploring){
    return <Navigate to={`/app/agendas/${agendaId}`}/>
  }else{
    return (<>
      {title != null && <Button
              type="text"
              className='p-2 font-semibold text-base w-full rounded-none justify-start'
              size='large'
              iconPosition='start'
              icon={<ChevronDoubleLeftIcon className="w-6 h-6" />}
              onClick={onReturnClick}
            >
              {title}
            </Button>}
        <div className="container-wide flex h-full">
          <div className="flex-1 !pl-8 !pr-4 py-10 overflow-y-scroll">
            <AggregateBox/>
          </div>
          
          <div className="flex-1 flex flex-col !pl-4 !pr-8 py-10 overflow-y-scroll">
            <div className="pb-10">
              <SummaryPanel/>
            </div>
            <div>
              <Debriefing/>
            </div>
          </div>
        </div>
    </>)
  }
}