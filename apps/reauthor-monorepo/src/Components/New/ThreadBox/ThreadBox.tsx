import { useEffect, useState, useCallback } from "react"
import getSocraticQuestions from "../../../APICall/getSocraticQuestions"
import getScaffoldingKeywords from "../../../APICall/getScaffoldingKeywords"
import getResponseFromKeyword from "../../../APICall/getResponseFromKeyword"
import getOrientingQuestions from "../../../APICall/getOrientingQuestions"
import { useSelector } from "react-redux"
import { IRootState } from "apps/reauthor-monorepo/src/Redux/store"
import { Radio, Space, Button, Input, Checkbox, Card, Anchor, Flex, Row } from "antd"
import type {RadioChangeEvent} from "antd"
import type { GetProp } from 'antd';
import { IThreadItem, ITypeAScaffoldingState } from "apps/reauthor-monorepo/src/Config/interface"
import getThreadData from "../../../APICall/getThreadData"
import saveThreadItem from "../../../APICall/saveThreadItem"
import { resetWorkingThread } from "../../../Redux/reducers/userSlice"
import getScaffoldingQuestions from "../../../APICall/getScaffoldingQuestions"
import saveOrientingInput from '../../../APICall/saveOrientingInput'
const {TextArea} = Input;
import getOrientingInput from "../../../APICall/getOrientingInput"

// const ResponseBox = () => {

// }

// const BreakQuestionScaffoldingBox = () => {

// }

// const KeywordScaffoldingBox = () => {

// }

// const ResponsePhase = () => {
//   const [mode, setMode] = useState("YET")
//   return (
//     <div>Mode: {mode}</div>
//   )
// }

const OrientingInput = (props:{
  handlePhase: (phase: number) => void,
  phase: number,
  tid: string
}) => {

  const [input, setInput] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async () => {
    await saveOrientingInput(props.tid, input)
    props.handlePhase(2);
  }

  const fetchOrientingInput = async() => {
    const orientingInput = await getOrientingInput(props.tid)
    if(orientingInput) {
      setInput(orientingInput)
    }
  }
  useEffect(() => {
    if(props.phase > 1){
      fetchOrientingInput()
    }
  },[props.phase])
  
  return(
    <div>
      {props.phase == 1? 
      <div>
        <TextArea rows={3} onChange={handleChange} value={input}/>
        <Button onClick={handleSubmit}>Submit Input</Button>
      </div>:
      <div>
        {input}
      </div>}
      
    </div>
  )
}

const QnASet = (props:{
  handlePhase: (phase: number) => void,
  phase: number,
  tid: string,
  theme: string
}) => {
  const uid = useSelector((state: IRootState) => state.userInfo.uid)

  const [selectedQ, setSelectedQ] = useState<string>('')
  const [isSetQ, setIsSetQ] = useState<boolean>(false)
  const [questionList, setQuestionList] = useState<string[]>([])
  const [tmpN, setTmpN] = useState<number>(0)
  const [scaffoldingKeywords, setScaffoldingKeywords] = useState<string[] | null>()
  const [response, setResponse] = useState<string>('')

  const fetchSocraticQuestions = async() => {
    const fetchedQuestions = await getSocraticQuestions(props.theme, uid)
    if(fetchedQuestions){
      setQuestionList(fetchedQuestions)
      setSelectedQ(fetchedQuestions[tmpN])
    }
  }
  const onSelectQuestion = async () => {
    setIsSetQ(true)
    // TODO: Add orientingInput as param of getScaffoldingKeywords
    const fetchedKeywords = await getScaffoldingKeywords(uid, selectedQ);
    setScaffoldingKeywords(fetchedKeywords)
  }
  const onRegenerate = () => {
    setSelectedQ(questionList[tmpN + 1])
    setTmpN(tmpN+1)
    // TODO: Handling when exceed length
  }
  const onSubmitResponse = async () => {
    // TODO: save orientingInput
    await saveThreadItem(props.tid, uid, selectedQ, {}, response)
    props.handlePhase(3)
  }

  useEffect(() => {
    fetchSocraticQuestions();
  },[props.phase])


  return(
    <div>
      {isSetQ?"setq":"notsetq"}
      <Flex vertical={false} className={(isSetQ || props.phase == 1)? 'hidden':''}>
        <TextArea value={selectedQ} onChange={(e) => setSelectedQ(e.target.value)}/>
        <Button onClick={onRegenerate} >Regenerate</Button>
        <Button onClick={onSelectQuestion}>Select</Button>
      </Flex>
      <Flex vertical={true} className={isSetQ? '':'hidden'}>
      <div>{selectedQ}</div>
        Scaffolding Keywords
        <Flex vertical={false}>
          <div>
            {scaffoldingKeywords?scaffoldingKeywords.map(keyword => <div>{keyword}</div>):"Loading keywords"}
          </div>
          <div>Drop here</div>
        </Flex>
        Response
        <TextArea className={isSetQ?'':'hidden'} onChange={(e) => setResponse(e.target.value)}/>
        <Button onClick={onSubmitResponse}>Submit Response</Button>
      </Flex>
    </div>
  )
}

const FinishedThread = (props:{
  tid: string,
  question: string,
  response: string
}) => {
  const [orientingInput, setOrientingInput] = useState('')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')

  const fetchThreadData = async () => {
    const fetchedThreadData = await getThreadData(props.tid)
    setQuestion(fetchedThreadData.question)
    setResponse(fetchedThreadData.response)
  }
  useEffect(() => {
    fetchThreadData()
  },[])
  return (
    <div>
      Oriented: TBD
      Question: {question}
      Response: {response}
    </div>
  )
}

const ThreadBox = (props:{
  theme: string,
  tid: string
}) => {
    /*
  - Phase 1: orienting input <OrientingInput/> , 
  - Phase 2-a: question clarify <QnASet/>, qset: false
  - Phase 2-b: response <ResponseInput/>, qset: true
  - Phase 3: Finished 
  */ 
  const workingStatus = useSelector((state: IRootState) => state.userInfo.working_thread)
  const [phase, setPhase] = useState<number>((props.tid===workingStatus.tid)?1:3)
  const [theme, setTheme] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [response, setResponse] = useState<string>('')

  const fetchThreadData = async () => {
    const fetchedThreadData = await getThreadData(props.tid)
    setTheme(fetchedThreadData.theme)
    if (phase == 3){
      setQuestion(question)
      setResponse(response)
    }
  }
  const handlePhase = (phase: number) => {
    setPhase(phase)
  }
  useEffect(() => {
    fetchThreadData();
  },[])


  return (
    <div>
      {phase}
      <Space direction="vertical" className="flex">
        <Card title={theme?theme: "Theme Loading"}>
          {phase < 3? 
          <div>
            <OrientingInput handlePhase={handlePhase} tid={props.tid} phase={phase}/>
            <QnASet handlePhase={handlePhase} phase={phase} tid={props.tid} theme={theme}/>
          </div>
          :
          <FinishedThread tid={props.tid} question={question} response={response}/>}
        </Card>
      </Space>
      
    </div>
  )
}

export default ThreadBox;