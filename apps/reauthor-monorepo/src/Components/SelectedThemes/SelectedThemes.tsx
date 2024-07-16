import { useSelector } from "react-redux";
import userSlice, { ITheme } from "../../Redux/reducers/userSlice";
import { useEffect, useState } from "react";
import { IRootState } from "../../Redux/store";
import { IUserState } from "../../Redux/reducers/userSlice";
import {generateQuestionFromContext} from '../../Utils/generateQuestion'
import { generateGranularItems } from '../../Utils/generateScaffolding'
import breakDownQuestion from "../../Utils/breakDownQuestion";

const QuestionItem = (props:{
  question: string
}) => {
  const [scaffoldingItems, setScaffoldingItems] = useState<string[]>([])
  const initialNarrative = useSelector((state: IUserState) => state.initial_narrative)
  const [isSelected, setIsSelected] = useState(false)
  // TODO: Update initial narrative => history
  useEffect( () => {
    const fetchScaffoldingItems = async () => {
      const items = await generateGranularItems(props.question, initialNarrative, 1)
      setScaffoldingItems(items.granularItemSet.map((item) => {
        return item.item
      }))
    }
    fetchScaffoldingItems();
  },[])
  const onSelect = () => {
    setIsSelected(!isSelected)
  }
  const onBreakDown = () => {
    //TODO: fill in
    breakDownQuestion();
  }
  return <div>
  <div>Question: {props.question + "\n"}</div>
  <div>Scaffolding Items: {scaffoldingItems.map(item => <div>{"- " +item + "\n"}</div>)}</div>
  <button onClick={onBreakDown}>[break down question]</button>
  <button onClick={onSelect}>[Select]</button>
  {isSelected? <input defaultValue={"default"}/>: <div>Unselected</div>}
</div>
}
const SelectedThemeItem = (props: {
  theme: ITheme,
  initialNarrative: string
}) => {
  const [questions, setQuestions] = useState<string[]>([])
  const generateQuestionSet = async (expression: string) => {
    const questionSet: string[] | undefined = await generateQuestionFromContext([props.initialNarrative], expression, 'newTheme') 
    
    if (questionSet) {
      setQuestions(questionSet)
      // setScaffoldingItems(scaffoldingItems.granularItemSet.map(item => item.item))
    } else {
      setQuestions(["Error in question invoke"])
    }
    
  }
  return (<div>
    <div>Theme: {props.theme.theme} </div>
     <button onClick={() => {
      generateQuestionSet(props.theme.theme)
     }}>[Generate Questions]</button>
     <div>{questions.map((question, index) => <div>[{index}] <QuestionItem question={question}/>{"\n"}</div>)}</div>
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