import { ITheme } from "../../Redux/reducers/userSlice"
import { useState, useEffect } from "react"
import { generateQuestionFromContext } from "../../Utils/generateQuestion"
import QnASet from "./QnASet"
import QuestionSelection from "./QuestionSelection"

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

  return (
  <div>
    <div>Theme: {props.theme.theme} </div>    
     {/* <button onClick={() => {
      generateQuestionSet(props.theme.theme)
     }}>[Generate Questions]</button> */}
     {selectedQuestion? 
     <div>Selected: <QnASet question={selectedQuestion}/></div>: 
     <div>{questions.slice(2).map((question, index) => <div><QuestionSelection question={question} onQuestionSelected={handleQuestionSelection}/>{"\n"}</div>)}</div>
     }     
  </div>
  )
}

export default SelectedThemeItem;