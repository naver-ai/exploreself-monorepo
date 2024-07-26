import { useCallback, useEffect, useMemo, useState } from "react"
import { Space, Button, Input, Card, Flex, Divider } from "antd"

import getThreadData from "../../../APICall/getThreadData"
import saveThreadItem from "../../../APICall/old/saveThreadItem"
const {TextArea} = Input;
import { useSelector } from "../../../Redux/hooks"
import { IThreadWithQuestionIds, IQASetWithIds } from "@core";
import saveQASet from "../../../APICall/saveQASet";
import getQuestions from "../../../APICall/getQuestions";

const Question = (props:{
  tid: string,
  question: string,
  selected: boolean
}) => {
  return (
    <div>
      {props.question}
      {props.selected && 
      <div>
        <Button>Gey keywords</Button>
        <TextArea rows={3}/>
      </div>}
    </div>
  )
}

const ThreadBox = (props:{
  tid: string
}) => {
  const [threadData, setThreadData] = useState<IThreadWithQuestionIds>();
  const token = useSelector((state) => state.userInfo.token) as string
  const [questions, setQuestions] = useState<string[]>()
  
  const fetchThreadData = useCallback(async () => {
    try {
      const data: IThreadWithQuestionIds = await getThreadData(token, props.tid);
      setThreadData(data);
    } catch (error) {
      console.error('Failed to fetch thread data:', error);
    }
  }, [props.tid]);

  const fetchQuestions = useCallback(async () => {
    const fetchedQuestions = await getQuestions(token, props.tid)
    setQuestions(fetchedQuestions.map((item :{question: string, intention: string}) => item.question))
    console.log("Q: ", questions)
  },[props.tid])

  const saveQASetHandler = useCallback(async(question: string, keywords: Array<string>, response: string) => {
    const success = await saveQASet(props.tid, question, keywords, response)
  },[props.tid])
  
  useEffect(() => {
    fetchThreadData();
    fetchQuestions();
  }, [fetchThreadData]);

  return (
    <div>
      <Space direction="vertical" className="flex">
        <Card title={threadData?threadData.theme: "Theme Loading"}>
        {threadData?.questions?.map((question) => {
          return (
          <div>
            Question: {(question as IQASetWithIds).question.content}
            Response: {(question as IQASetWithIds).response}
          </div>)
        })}
        {/* {questions?.map(q => q)} */}
        {/* {questions?.map(q => q)} */}
        {questions?.map(q => q)}
        </Card>
      </Space>
      
    </div>
  )
}

export default ThreadBox;