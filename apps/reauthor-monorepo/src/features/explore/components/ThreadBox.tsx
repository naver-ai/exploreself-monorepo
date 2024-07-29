import { useCallback, useEffect, ChangeEvent, useState } from "react"
import { Space, Button, Input, Card, Flex, Divider, Row, Col } from "antd"

import getThreadData from "../../../api_call/getThreadData"
import saveThreadItem from "../../../api_call/old/saveThreadItem"
const {TextArea} = Input;
import { useSelector } from "../../../redux/hooks"
import { IThreadWithQuestionIds, IQASetWithIds, IQASetBase } from "@core";
import {updateResponse, saveQASetArray, selectQuestion, saveComment} from "../../../api_call/saveQASet";
import generateQuestions from "../../../api_call/generateQuestions";
import getKeywords from '../../../api_call/getKeywords'
import getQuestionData from "../../../api_call/getQuestionData";
import generateComment from "../../../api_call/generateComment";

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
  const [selected, setSelected] = useState(false);
  const [comment, setComment] = useState()

  const fetchQuestion = useCallback(async () => {
    const qData = await getQuestionData(token, props.qid)
    setQuestion(qData.question.content)
    setResponse(qData.response)
    setLastSavedResponse(qData.response)
    setKeywords(qData.keywords)
    setSelected(qData.selected)
  },[props.qid])

  const fetchComment = useCallback(async () => {
    const comment = await generateComment(token, props.qid, response)
    const isSavedComment = await saveComment(token, props.qid, comment.comment) // TODO: combine generateComment + saveComment
    setComment(comment.comment)
  },[])

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
        {/* // TODO: AI Feedback  */}
        {selected &&
        <Row>
          <Col span={20}>
            <Button onClick={() => {fetchKeywordsHandler()}}>Get Keywords</Button>
            {keywords?.join(', ')}
            <TextArea 
            value={response}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            />
          </Col>
          <Col span={4}>
            <Button onClick={() => fetchComment()}>Comment</Button>
            {"Comment: " && comment}
          </Col>
        </Row> 
        }
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