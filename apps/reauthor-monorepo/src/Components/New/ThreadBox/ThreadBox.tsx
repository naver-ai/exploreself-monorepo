import { useEffect, useMemo, useState } from "react"
import getReflexiveQuestions from "../../../APICall/old/getReflexiveQuestions"
import getScaffoldingKeywords from "../../../APICall/old/getScaffoldingKeywords"
import getThemeScaffoldingKeywords from '../../../APICall/old/getThemeScaffolding'
import { Space, Button, Input, Card, Flex, Divider } from "antd"
import { DeleteOutlined } from '@ant-design/icons';

import getThreadData from "../../../APICall/old/getThreadData"
import saveThreadItem from "../../../APICall/old/saveThreadItem"
import saveOrientingInput from '../../../APICall/old/saveOrientingInput'
const {TextArea} = Input;
import getOrientingInput from "../../../APICall/old/getOrientingInput"
import { useSelector } from "../../../Redux/hooks"


const OrientingInput = (props:{
  handlePhase: (phase: number) => void,
  phase: number,
  tid: string,
  theme: string
}) => {

  const [input, setInput] = useState<string>('')
  const uid= useSelector((state) => state.userInfo.userId)
  const [themeScaffolding, setThemeScaffolding] = useState<{item: string, rationale: string}[]>([])
  const [visibleItems, setVisibleItems] = useState<{ item: string, rationale: string }[]>([]);
  
  const handleShowMore = () => {
    const nextItem = themeScaffolding[visibleItems.length];
    if (nextItem) {
      setVisibleItems([...visibleItems, nextItem]);
    }
  };

  const handleDelete = (index: number) => {
    const newVisibleItems = visibleItems.filter((_, i) => i !== index);
    setVisibleItems(newVisibleItems);
  };

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

  const fetchThemeScaffoldings = async() => {
    const scaffoldingSet = await getThemeScaffoldingKeywords(uid!, props.theme)
    if(scaffoldingSet){
      setThemeScaffolding(scaffoldingSet)
      setVisibleItems([scaffoldingSet[0]])
    }
  }

  useEffect(() => {
    fetchThemeScaffoldings();
  },[])

  useEffect(() => {
    if(props.phase > 1){
      fetchOrientingInput()
    }
  },[props.phase])
  
  const onDragScaffolding = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const value = target.getAttribute('data-value');
    if (value) {
      e.dataTransfer.setData('scaffolding', value);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('scaffolding');
    if (data) {
      setInput(prevValue => prevValue ? `${prevValue}\n [${data}] ` : `[${data}] `);
    }
  }
  const onDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };
  
  
  return(
    <div>
      {props.phase == 1? 
      <div>
        <Flex vertical={false}>
          <Flex vertical={true}>

          {visibleItems.map((scaffolding, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div draggable={true} onDragStart={onDragScaffolding} data-value={scaffolding.item}>{scaffolding.item}</div>
              <Button onClick={() => handleDelete(index)} icon={<DeleteOutlined/>}/>
            </div>
          ))}
          
          
          
            {visibleItems.length < themeScaffolding.length && (
              
              <Button onClick={handleShowMore}>Show more</Button>
            )}
          </Flex>
          <TextArea rows={3} onChange={handleChange} value={input} onDragOver={onDragOver} onDrop={onDrop}/>
        </Flex>
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
  const uid = useSelector(state => state.userInfo.userId)

  const [selectedQ, setSelectedQ] = useState<string>('')
  const [isSetQ, setIsSetQ] = useState<boolean>(false)
  const [questionList, setQuestionList] = useState<string[]>([])
  const [tmpN, setTmpN] = useState<number>(0)
  const [scaffoldingKeywords, setScaffoldingKeywords] = useState<string[]>([])
  const [response, setResponse] = useState<string>('')
  const [orienting, setOrienting] = useState<string | null>('')
  const [visibleItems, setVisibleItems] = useState<string[]>([])

  const handleShowMore = () => {
    const nextItem = scaffoldingKeywords[visibleItems.length];
    if (nextItem) {
      setVisibleItems([...visibleItems, nextItem]);
    }
  };

  const handleDelete = (index: number) => {
    const newVisibleItems = visibleItems.filter((_, i) => i !== index);
    setVisibleItems(newVisibleItems);
  };

  const fetchOrienting = async() => {
    const orientingInput = await getOrientingInput(props.tid)
    setOrienting(orientingInput)
  }

  const fetchSocraticQuestions = async() => {
    if(orienting){
      const fetchedQuestions = await getReflexiveQuestions(props.theme, uid!, orienting)
      if(fetchedQuestions){
        setQuestionList(fetchedQuestions)
        setSelectedQ(fetchedQuestions[tmpN])
      }
    }
  }
  const onSelectQuestion = async () => {
    setIsSetQ(true)
    // TODO: Add orientingInput as param of getScaffoldingKeywords
    const fetchedKeywords = await getScaffoldingKeywords(uid!, selectedQ);
    if(fetchedKeywords){
      setScaffoldingKeywords(fetchedKeywords)
      setVisibleItems([scaffoldingKeywords[0]]);
    }
  }
  const onRegenerate = () => {
    setSelectedQ(questionList[tmpN + 1])
    setTmpN(tmpN+1)
    // TODO: Handling when exceed length
  }
  const onSubmitResponse = async () => {
    // TODO: save orientingInput
    await saveThreadItem(props.tid, uid!, selectedQ, {}, response)
    props.handlePhase(3)
  }

  useEffect(() => {
    fetchOrienting();
  },[props.phase])

  useEffect(() => {
    fetchSocraticQuestions();
  },[props.phase, orienting])


  return(
    <div>
      {/* {isSetQ?"setq":"notsetq"} */}
      <Flex vertical={false} className={(isSetQ || props.phase == 1)? 'hidden':''}>
        <TextArea value={selectedQ} onChange={(e) => setSelectedQ(e.target.value)}/>
        <Button onClick={onRegenerate} >Regenerate</Button>
        <Button onClick={onSelectQuestion}>Select</Button>
      </Flex>
      <Flex vertical={true} className={isSetQ? '':'hidden'}>
      <div>{selectedQ}</div>
        <Flex vertical={false}>
        <div>
          {scaffoldingKeywords?scaffoldingKeywords.map(keyword => <div>{keyword}</div>):"Loading keywords"}
        </div>
        <TextArea className={isSetQ?'':'hidden'} onChange={(e) => setResponse(e.target.value)}/>
        </Flex>
        
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
    setOrientingInput(fetchedThreadData.orientingInput)
    setQuestion(fetchedThreadData.question)
    setResponse(fetchedThreadData.response)
  }
  useEffect(() => {
    fetchThreadData()
  },[])
  return (
    <div>
      <div>Oriented: {orientingInput}</div>
      <div>Question: {question}</div>
      <div>Response: {response}</div>
      <Flex vertical={false}>
        <Button>Write more</Button>
        <Button>Get another question to think about</Button>
      </Flex>
      
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
  const workingStatus = useSelector((state) => state.userInfo.working_thread)
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
            <OrientingInput handlePhase={handlePhase} tid={props.tid} phase={phase} theme={theme}/>
            <Divider/>
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