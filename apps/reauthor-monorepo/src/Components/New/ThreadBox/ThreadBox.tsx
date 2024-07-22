import { useEffect, useState, useCallback } from "react"
import genQuestions from "../../../APICall/genQuestions"
import getScaffoldingKeywords from "../../../APICall/getScaffoldingKeywords"
import getResponseFromKeyword from "../../../APICall/getResponseFromKeyword"
import { useDispatch, useSelector } from "react-redux"
import { IRootState } from "apps/reauthor-monorepo/src/Redux/store"
import { Radio, Space, Button, Input, Checkbox } from "antd"
import type {RadioChangeEvent} from "antd"
import type { GetProp } from 'antd';
import { IThreadItem, ITypeAScaffoldingState } from "apps/reauthor-monorepo/src/Config/interface"
import getThreadData from "../../../APICall/getThreadData"
import saveThreadItem from "../../../APICall/saveThreadItem"
import { resetWorkingThread } from "../../../Redux/reducers/userSlice"
import { type } from "os"

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

const ThreadBox = (props: {
  theme: string,
  tid: string
}) => {
  // State: question selection, response, finished 
  const [theme, setTheme] = useState<string | null>(null)
  const [resPhase, setResPhase] = useState(false)
  const [questions, setQuestions] = useState<string[] | null>([])
  const [selectedQ, setSelectedQ] = useState<string>("")
  const [scaffoldingKeywords, setScaffoldingKeywords] = useState<string[] | null>([])
  const [plausibleResponse, setPlausibleResponse] = useState<string[] | null>([])
  const [response, setResponse] = useState<string>("")
  const workState = props.tid === useSelector((state: IRootState) => state.userInfo.working_thread.tid)
  const [threadData, setThreadData] = useState<IThreadItem | null>(null)
  const [typeAScaffoldingData, setTypeAScaffoldingData] = useState<ITypeAScaffoldingState>({
    tried: false,
    unselected_keywords: [],
    selected_keywords: [],
    user_added_keywords: [],
    selected_generated_sentence: []
  })
  const uid = useSelector((state: IRootState) => state.userInfo.uid)
  const dispatch = useDispatch()

  const fetchKeywords = async () => {
    const fetchedKeywords = await getScaffoldingKeywords(uid, selectedQ);
    setScaffoldingKeywords(fetchedKeywords)

  }
  const fetchResponse = async() => {
    const fetchedResponse = await getResponseFromKeyword(selectedQ, typeAScaffoldingData.selected_keywords, uid)
    setPlausibleResponse(fetchedResponse)
  }
  const fetchThreadData = async () => {
    const fetchedThreadData = await getThreadData(props.tid)
    setThreadData(fetchedThreadData)
    const theme = fetchedThreadData.theme
    setTheme(theme)
    if (workState) {
      if (!resPhase) {
        const fetchedQuestions = await genQuestions(fetchedThreadData.theme, uid)
        setQuestions(fetchedQuestions)
      }
    }
  }
  const { TextArea } = Input;

  useEffect(() => {
    fetchThreadData();
  },[])

  useEffect(() => {
    fetchKeywords();
  },[resPhase])


  const onChangeQSelect = (e: RadioChangeEvent) => {
    setSelectedQ(e.target.value)
  }

  const onSubmitQ = () => {
    // TODO: Handling when input value is empty
    setResPhase(true)
  }

  const onSelectKeywords: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
    const stringCheckedValues = checkedValues as string[];
    setTypeAScaffoldingData(prevState => ({
      ...prevState,
      tried: true,
      selected_keywords: stringCheckedValues
    }))
  };

  const onSubmitKeywords = async () => {
    await fetchResponse()
  }

  const onDragRes = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const value = target.getAttribute('data-value');
    if (value) {
      e.dataTransfer.setData('res', value);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('res');
    if (data) {
      setTypeAScaffoldingData(prevState => ({
        ...prevState,
        selected_generated_sentence: [...typeAScaffoldingData.selected_generated_sentence,data]
      }))
      setResponse(prevValue => prevValue ? `${prevValue} ${data}` : data);
    }
  }
  const onDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const onSubmitResponse = async () => {
    await saveThreadItem(props.tid, selectedQ, {typeA: typeAScaffoldingData}, response)
    dispatch(resetWorkingThread())
  }

  return (
    <div>
      {workState?
      <div>
        THEME: {theme?theme: "Theme Loading"}
        {resPhase? 
        <div>
          <div>{selectedQ}</div>
          <Checkbox.Group style={{ width: '100%' }} onChange={onSelectKeywords}>
          {scaffoldingKeywords?.length? scaffoldingKeywords?.map(keyword => <Checkbox value={keyword}>{keyword}</Checkbox>): <div>Loading Keywords</div>}
          </Checkbox.Group>
          <Button onClick={onSubmitKeywords}>Selected Keywords</Button>
          <div>
            {plausibleResponse?.length? plausibleResponse?.map(res => <div draggable={true} onDragStart={onDragRes} data-value={res}>{res}</div>): "Loading"}
          </div>
          <TextArea rows={4} onDrop={onDrop} value={response} onDragOver={onDragOver} onChange={(e) => setResponse(e.target.value)}/>
          <Button onClick={onSubmitResponse}>Submit Response</Button>
        </div>
        : 
        <div>
        {questions? 
        <div>
          <Radio.Group onChange={onChangeQSelect} value={selectedQ}>
            <Space direction="vertical">
            {questions.map(q => (
              <Radio value={q}>{q}</Radio>
            ))}
            </Space>
          </Radio.Group>
          <Button onClick={onSubmitQ}>Selected</Button>
        </div>
        :"Questions loading"}
      </div>
        }
      </div>:
      <div>
        Theme: {threadData?.theme}
        Question: {threadData?.question}
        Response: {threadData?.response}
      </div>}
      
      
    </div>
  )
}

export default ThreadBox;