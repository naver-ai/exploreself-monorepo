import { AggregateBox } from "../components/AggregateBox"
import { SummaryPanel } from "../components/SummaryPanel"
import { useSelector } from "../../../redux/hooks"
import { questionSelectors } from "../reducer"
import { useRef } from "react"
import Debriefing from "../components/Debriefing"
import { SessionStatus } from "@core"
import { Navigate } from "react-router-dom"

type QuestionRefs = {
  [key: string]: HTMLDivElement | null;
};

export const SummaryPage = () => {

  const allQuestions = useSelector((state) => questionSelectors.selectAll(state));
  const filteredQuestions = allQuestions
    .filter(q => q.response && q.response.length > 0)
  const questionRefs = useRef<QuestionRefs>({});
  const scrollToQuestion = (id: string) => {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
  };

  const sessionStatus = useSelector(state => state.agenda.sessionStatus)

  if(sessionStatus == SessionStatus.Exploring){
    return <Navigate to="/app"/>
  }else{
    return (
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
    )
  }
}