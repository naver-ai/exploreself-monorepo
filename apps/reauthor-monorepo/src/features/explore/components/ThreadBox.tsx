import { useCallback, useEffect, ChangeEvent, useState } from "react"
import { Space, Button, Input, Card, Flex, Divider } from "antd"

import getThreadData from "../../../APICall/getThreadData"
import saveThreadItem from "../../../APICall/old/saveThreadItem"
const {TextArea} = Input;
import { useSelector } from "../../../Redux/hooks"
import { IThreadWithQuestionIds, IQASetWithIds, IQASetBase } from "@core";
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
  const token = useSelector((state) => state.auth.token) as string
  const [questions, setQuestions] = useState<Array<IQASetBase>>([])
  const [removedQuestions, setRemovedQuestions] = useState<Array<string>>([])
  
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
      const questionsWithEmptyFields: IQASetBase[] = fetchedQuestions.map(
        (item: { question: string }) => ({
          tid: props.tid,
          question: { content: item.question },
          keywords: [],
          response: ''
        })
      );
      setQuestions(questionsWithEmptyFields);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  },[props.tid, token])

  const saveQASetHandler = useCallback(async() => {
    if(questions){
      const isSaved = await saveQASet(token, props.tid, questions)
    }
  },[props.tid, questions, token])

  const handleRemoveQuestion = useCallback((index: number) => {
    const questionToRemove = questions[index];
    setQuestions(questions.filter((_, i) => i !== index));
    setRemovedQuestions([...removedQuestions, questionToRemove.question.content]);
  }, [questions, removedQuestions]);

  const handleAddRemovedQuestion = useCallback((index: number) => {
    const questionToAdd = {
      tid: props.tid,
      question: { content: removedQuestions[index]},
      keywords: [],
      response: ''
    };
    setRemovedQuestions(removedQuestions.filter((_, i) => i !== index)); 
    setQuestions([...questions, questionToAdd]);
  }, [removedQuestions, questions]);


  const handleResponseChange = useCallback((index: number, event: ChangeEvent<HTMLTextAreaElement>) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      response: event.target.value
    };
    setQuestions(newQuestions);
  },[questions]);
  
  useEffect(() => {
    fetchThreadData();
    // TODO: Resolve err in 시도때도없이 fetchQUestions() call 되는 것
    fetchQuestions();
  }, []);

  return (
    <div>
      <Space direction="vertical" className="flex">
        <Card title={threadData?threadData.theme: "Theme Loading"}>
        {threadData?.questions?.map((question) => {
          return (
          <div>
            {(question as IQASetWithIds).question.content}
            <TextArea value={(question as IQASetWithIds).response}/>
          </div>)
        })}
        <Flex vertical={false} className="space-x-2">
          <div className="border">
            질문 저장소
            {removedQuestions.map((q, index) => 
            <div>
              {q}
              <Button onClick={() => handleAddRemovedQuestion(index)}>추가</Button>
            </div>)}
          </div>
          <div>
          AI와 생각해보기
          {questions?.map((qa, index) => (
            <div key={index}>
              {qa.question.content}
              <Button onClick={() => handleRemoveQuestion(index)}>x</Button> 
              <TextArea
                value={qa.response}
                onChange={(e) => handleResponseChange(index, e)}
              />
            </div>
          ))}
          </div>
        </Flex>
        
        <Button onClick={saveQASetHandler}>저장하기</Button>
        </Card>
      </Space>
      
    </div>
  )
}

export default ThreadBox;