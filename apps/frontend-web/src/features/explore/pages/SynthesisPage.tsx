import { Input } from "antd"
import { AggregateBox } from "../components/AggregateBox"
import SynthesisBox from "../components/SynthesisBox"
import {Flex, Row, Col} from "antd"
import { useSelector } from "../../../redux/hooks"
import { questionSelectors } from "../reducer"
import { useRef } from "react"
import Debriefing from "../components/Debriefing"

type QuestionRefs = {
  [key: string]: HTMLDivElement | null;
};

export const SynthesisPage = () => {

  const allQuestions = useSelector((state) => questionSelectors.selectAll(state));
  const filteredQuestions = allQuestions
    .filter(q => q.response && q.response.length > 0)
  const questionRefs = useRef<QuestionRefs>({});
  const scrollToQuestion = (id: string) => {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex py-10">
      <div className="flex-none w-1/2 px-20">
        <AggregateBox/>
      </div>
      
      <div className="flex flex-col w-1/2 pr-20">
        <div className="pb-10">
          <SynthesisBox/>
        </div>
        <div>
          <Debriefing/>
        </div>
      </div>
    </div>
  )
}