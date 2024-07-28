import { useCallback, useEffect, ChangeEvent, useState } from "react"
import { Space, Button, Input, Card, Flex, Divider } from "antd"

import getThreadData from "../../../api_call/getThreadData"
import saveThreadItem from "../../../api_call/old/saveThreadItem"
const {TextArea} = Input;
import { useSelector } from "../../../redux/hooks"
import { IThreadWithQuestionIds, IQASetWithIds, IQASetBase } from "@core";
import {updateResponse, saveQASetArray, selectQuestion} from "../../../api_call/saveQASet";
import generateQuestions from "../../../api_call/generateQuestions";
import getKeywords from '../../../api_call/getKeywords'
import getQuestionData from "../../../api_call/getQuestionData";
import { generate } from "@langchain/core/dist/utils/fast-json-patch";

const Question = (props:{
  qid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [question, setQuestion] = useState<string>()
  const [response, setResponse] = useState<string>('')
  const [keywords, setKeywords] = useState<Array<string>>()
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedResponse, setLastSavedResponse] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [selected, setSelected] = useState(false)

  const fetchQuestion = useCallback(async () => {
    const qData = await getQuestionData(token, props.qid)
    setQuestion(qData.question.content)
    setResponse(qData.response)
    setLastSavedResponse(qData.response)
    setKeywords(qData.keywords)
    setSelected(qData.selected)
  },[props.qid])

  const saveResponse = useCallback(async () => {
    if (response !== lastSavedResponse) {
      setIsSaving(true);
      try {
        const savedQA = await updateResponse(token, props.qid, response)
        setLastSavedResponse(response);
      } catch (error) {
        console.error('Failed to save content:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [response, props.qid, lastSavedResponse]);

  const fetchKeywordsHandler = useCallback(async () => {
    const keywords = await getKeywords(token, props.qid)
    setKeywords(keywords as Array<string>)
  },[token, props.qid])

  const selectQuestionHandler = useCallback(async () => {
    try {
      const selectedQA = await selectQuestion(token, props.qid)
      console.log("QA: ", selectedQA)
      setSelected(true)
    } catch (err) {
      console.log("Err in selecting question")
    }
  },[])


  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(event.target.value);
    setIsActive(true); 
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false); 
  };

  useEffect(() => {
    fetchQuestion();
  },[])

  useEffect(() => {
    if (isActive) {
      const handle = setTimeout(saveResponse, 1000);
      return () => clearTimeout(handle);
    }
  }, [response, isActive, saveResponse]);

  return (
    <div>
      {question}
      <Button onClick={() => {selectQuestionHandler()}}>Select</Button>
      <Flex vertical={false}>
        {/* // TODO: AI Feedback  */}
        {selected && 
        <div>
          <Button onClick={() => {fetchKeywordsHandler()}}>Get Keywords</Button>
          {keywords?.join(', ')}
          <TextArea 
          value={response}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          />
        </div>
        }
        
      </Flex> 
    </div>
  )
}

const ThreadBox = (props: {
  tid: string
}) => {
  const [threadData, setThreadData] = useState<IThreadWithQuestionIds>();
  const token = useSelector((state) => state.auth.token) as string
  const fetchThreadData = useCallback(async () => {
    try {
      const data: IThreadWithQuestionIds = await getThreadData(token, props.tid);
      setThreadData(data);
    } catch (error) {
      console.error('Failed to fetch thread data:', error);
    }
  }, [props.tid]);
  
  const fetchQuestions = useCallback(async () => {
    try {
      const fetchedQuestions = await generateQuestions(token, props.tid)
      const data: IThreadWithQuestionIds = await getThreadData(token, props.tid);
      setThreadData(data);
      // TODO: better optimize 
    } catch (err){
      console.error('Failed to fetch questions:', err);
    }
  },[token, props.tid])

  useEffect(() => {
    fetchThreadData();   
    if(threadData?.questions.length == 0){
      fetchQuestions();
    }
  }, []);

  return (
    <div>
      <Card title={threadData?threadData.theme: "Theme Loading"}>
        <Flex vertical={false} className="space-x-2">
          <Flex vertical={true}>
            {threadData?.questions?.map((question) => <Question qid={(question as string)}/>)}
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}

export default ThreadBox;