import { useSelector } from "react-redux";
import userSlice, { ITheme } from "../../Redux/reducers/userSlice";
import { useEffect, useState } from "react";
import { IRootState } from "../../Redux/store";
import { IUserState } from "../../Redux/reducers/userSlice";
import {generateQuestionFromContext} from '../../Utils/generateQuestion'
import { generateGranularItems } from '../../Utils/generateScaffolding'
import breakDownQuestion from "../../Utils/breakDownQuestion";
import TextArea from "antd/es/input/TextArea";

const QnASet = (props:{
  question: string
}) => {
  const userInfo = useSelector((state: IRootState) => state.userInfo)
  const [scaffoldingItems, setScaffoldingItems] = useState<string[]>([])
  const [isScaffoldingFetched, setIsScaffoldingFetched] = useState(false) 
  const [altQ, setAltQ] = useState<string[]>([])

  useEffect( () => {
    const fetchScaffoldingItems = async () => {
      const items = await generateGranularItems(props.question, userInfo.initial_narrative, 1)
      setScaffoldingItems(items.granularItemSet.map((item) => item.item))
      setIsScaffoldingFetched(true)
    }
    fetchScaffoldingItems();
  },[])

  const onBreakDown = async () => {
    const altQuestions = await breakDownQuestion(userInfo, props.question)
    setAltQ(altQuestions)
  }

  return <div>
    <div>
      {props.question}
      <button onClick={onBreakDown}>Easier</button>
    </div>
    <div>AltQ: {altQ.length > 0 ? (altQ.map(q => <div>- {q}</div>)):'loading'}</div>
    <div>Scaffoldings: {scaffoldingItems.map((item: string) => {
      return <div>{item}</div>
    })}</div>

    {isScaffoldingFetched?<TextArea/>:<div></div>}
  </div>
}

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

  return <div>
  <div>Question: {props.question + "\n"}</div>
  {/* <div>Scaffolding Items: {scaffoldingItems.map(item => <div>{"- " +item + "\n"}</div>)}</div> */}
  {/* <button onClick={onBreakDown}>[break down question]</button> */}
  <button onClick={onSelect}>[Select]</button>
  {/* <div>AltQ: {altQ.length > 0 ? (altQ.map(q => <div>- {q}</div>)):'loading'}</div> */}
  {isSelected? <input defaultValue={"default"}/>: <div>Unselected</div>}
</div>
}

const SelectedThemeItem = (props: {
  theme: ITheme,
  initialNarrative: string
}) => {
  const [questions, setQuestions] = useState<string[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>()
  const generateQuestionSet = async (expression: string) => {
    const questionSet: string[] | undefined = await generateQuestionFromContext([props.initialNarrative], expression, 'newTheme') 
    
    if (questionSet) {
      setQuestions(questionSet)
      // setScaffoldingItems(scaffoldingItems.granularItemSet.map(item => item.item))
    } else {
      setQuestions(["Error in question invoke"])
    }
  }

  const handleQuestionSelection = (selectedQuestion: string) => {
    setSelectedQuestion(selectedQuestion)
  }
  useEffect(() => { 
    generateQuestionSet(props.theme.theme)
    console.log("QUESTIONS: ", questions)
  },[])

  useEffect(() => {

  },[selectedQuestion])

  return (<div>
    <div>Theme: {props.theme.theme} </div>
     {/* <button onClick={() => {
      generateQuestionSet(props.theme.theme)
     }}>[Generate Questions]</button> */}
     {selectedQuestion? 
     <div>Selected: <QnASet question={selectedQuestion}/></div>: 
     <div>{questions.slice(2).map((question, index) => <div>[{index}] <QuestionSelection question={question} onQuestionSelected={handleQuestionSelection}/>{"\n"}</div>)}</div>
     }
     
  </div>
  )
}

const SelectedThemes = () => {
  const initialNarrative = useSelector((state: IRootState) => state.userInfo.initial_narrative)
  const themes: ITheme[] = useSelector((state: IRootState) => state.userInfo.themes)
  const [activatedThemes, setActivatedThemes] = useState<ITheme[]>(themes.filter((theme) => theme.activated))
  useEffect(() => {
    setActivatedThemes(themes.filter((theme) => theme.activated))
  },[themes])

  return (
    <div>
      SELECTED THEMES{"\n"}
      {activatedThemes.map((theme: ITheme) => {
        return <SelectedThemeItem theme={theme} initialNarrative={initialNarrative}/>
      })}
    </div>
  )
}

export default SelectedThemes;