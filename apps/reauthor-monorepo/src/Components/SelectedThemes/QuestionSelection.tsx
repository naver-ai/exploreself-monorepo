import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { IRootState } from "../../Redux/store";
import breakDownQuestion from "../../Utils/breakDownQuestion";

const QuestionSelection = (props:{
  question: string,
  onQuestionSelected: (q: string) => void;
}) => {
  const userInfo = useSelector((state: IRootState) => state.userInfo)
  const [isSelected, setIsSelected] = useState(false)
  const [isScaffoldingFetched, setIsScaffoldingFetched] = useState(false)
  const [altQ, setAltQ] = useState<string[]>([])
  // TODO: Update initial narrative => history

  const onSelect = () => {
    props.onQuestionSelected(props.question);
    setIsSelected(!isSelected)
    // props.onQuestionSelected(props.question, scaffoldingItems)
  }
  const onBreakDown = async () => {
    console.log("Break down question!")
    const altQuestionsObj = await breakDownQuestion(userInfo, props.question)
    console.log("AltQ: ", altQuestionsObj)
    // const altQuestions = altQuestionsObj.questions
  
    // setAltQ(altQuestions)
  }

  return <div className="border-black bg-violet-50 p-5">
  <div>Question: {props.question + "\n"}</div>
  {/* <div>Scaffolding Items: {scaffoldingItems.map(item => <div>{"- " +item + "\n"}</div>)}</div> */}
  {/* <button onClick={onBreakDown}>[break down question]</button> */}
  <button onClick={onSelect}>[Select]</button>
  {/* <div>AltQ: {altQ.length > 0 ? (altQ.map(q => <div>- {q}</div>)):'loading'}</div> */}
  {isSelected? <input defaultValue={"default"}/>: <div>Unselected</div>}
</div>
}

export default QuestionSelection