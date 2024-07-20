import { useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { IRootState } from "../../Redux/store"
import breakDownQuestion from "../../Utils/breakDownQuestion"
import { generateGranularItems } from "../../Utils/generateScaffolding"
import TextArea from "antd/es/input/TextArea"
import { Button } from "antd"

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

  const onDeeper = async () => {

  }

  const onNewAgenda = async() => {

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
    <div>
      <Button>Deeper </Button>
      <Button>New Agenda </Button>
    </div>
  </div>
}

export default QnASet;