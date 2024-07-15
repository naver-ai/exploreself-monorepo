import { generate } from "@langchain/core/dist/utils/fast-json-patch"
import { useState, useEffect } from "react"
import { generateQuestionFromContext } from '../../Utils/generateQuestion'
import { generateGranularItems } from '../../Utils/generateScaffolding'
import { UseSelector, useSelector } from "react-redux"

import axios from "axios"
import { IUserState } from "../../Redux/reducers/userSlice"
import { isEmptyObj } from "openai/core"


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

  }

  return <div>
    <div>Question: {props.question + "\n"}</div>
    <div>Scaffolding Items: {scaffoldingItems.map(item => <div>{"- " +item + "\n"}</div>)}</div>
    <button onClick={onBreakDown}>break down question</button>
    <button onClick={onSelect}>Select</button>
    {isSelected? <input/>: <div>Unselected</div>}
    
  </div>
}

const HintItem = () => {

}
const ExpressionItem = (props: {
  expression: string
}) => {

  const [questions, setQuestions] = useState<string[]>([])
  const [scaffoldingItems, setScaffoldingItems] = useState<string[][]>([])
  const initialNarrative = useSelector((state: IUserState) => state.initial_narrative)

  const generateQuestionSet = async (expression: string) => {
    const questionSet: string[] | undefined = await generateQuestionFromContext([initialNarrative], expression, 'newTheme') 
    
    if (questionSet) {
      setQuestions(questionSet)
      // setScaffoldingItems(scaffoldingItems.granularItemSet.map(item => item.item))
    } else {
      setQuestions(["Error in question invoke"])
    }
    
  }

  return(
    <div>
      {props.expression}
      <button onClick={() => {
        generateQuestionSet(props.expression)
      }}>select</button>
      <div>
        {questions. map((q) => {
          return <div>
            <QuestionItem question={q}/> 
          </div>
        })}
      </div>
    </div>
  )
}

const ThemeItem = (props:{
  theme: Array<string>
}) => {
  return(
    <div className='border border-black'>
      <ul>
        {props.theme.map((exp, index) => {
          return <ExpressionItem expression={exp}/>
        })}
      </ul>
    </div>
  )
}
export default ThemeItem;