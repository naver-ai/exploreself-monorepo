import { useCallback, useEffect, ChangeEvent, useState } from "react"
import { Space, Button, Input, Card, Flex, Divider } from "antd"

import getThreadData from "../../../APICall/getThreadData"
import saveThreadItem from "../../../APICall/old/saveThreadItem"
const {TextArea} = Input;
import { useSelector } from "../../../Redux/hooks"
import { IThreadWithQuestionIds, IQASetWithIds, IQASetBase } from "@core";
import {updateQASet, saveQASetArray} from "../../../APICall/saveQASet";
import getQuestions from "../../../APICall/getQuestions";
import getScaffoldingKeywords from '../../../APICall/getScaffoldingKeywords'
import getQuestionData from "../../../APICall/getQuestionData";

const SelectedQuestion = (props:{
  qid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [question, setQuestion] = useState<string>()
  const [response, setResponse] = useState<string>()
  const [keywords, setKeywords] = useState<Array<string>>()
  const fetchQuestion = useCallback(async () => {
    const qData = await getQuestionData(token, props.qid)
    setQuestion(qData.question.content)
    setResponse(qData.response)
    setKeywords(qData.keywords)
  },[props.qid])

  useEffect(() => {
    fetchQuestion();
  },[])
  return (
    <div>
      {question}
      <Flex vertical={false}>
        {/* // TODO: AI Feedback  */}
        {keywords?.join(',')}
        <TextArea value={response}/>
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
      const fetchedQuestions = await getQuestions(token, props.tid)
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
            {threadData?.questions?.map((question) => <SelectedQuestion qid={(question as string)}/>)}
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}

export default ThreadBox;