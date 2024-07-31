import { useCallback, useEffect, ChangeEvent, useState } from "react"
import { Space, Button, Input, Card, Flex, Divider, Row, Col, Collapse } from "antd"
import { PlusOutlined, DeleteOutlined, ReloadOutlined} from '@ant-design/icons';
import getThreadData from "../../../api_call/getThreadData"
const {TextArea} = Input;
import { useSelector } from "../../../redux/hooks"
import { IThreadWithQuestionIds, IQASetWithIds, IQASetBase } from "@core";
import {updateResponse, saveQASetArray, selectQuestion, saveComment, unSelectQuestion} from "../../../api_call/saveQASet";
import generateQuestions from "../../../api_call/generateQuestions";
import generateKeywords from '../../../api_call/generateKeywords'
import getQuestionData from "../../../api_call/getQuestionData";
import generateComment from "../../../api_call/generateComment";
import { getSelectedQuestionList, getUnselectedQuestionList } from "../../../api_call/get_question_list";
import getCommentList from "../../../api_call/getCommentList";
import { current } from "@reduxjs/toolkit";

const SelectedQuestionItem = (props:{
  qid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [question, setQuestion] = useState<string>()
  const [response, setResponse] = useState<string>('')
  const [keywords, setKeywords] = useState<Array<string>>()
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedResponse, setLastSavedResponse] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [comment, setComment] = useState<string>()
  const [commentList, setCommentList] = useState<Array<string> | null>()

  const fetchQuestion = useCallback(async () => {
    const qData = await getQuestionData(token, props.qid)
    setQuestion(qData.question.content)
    setResponse(qData.response)
    setLastSavedResponse(qData.response)
    setKeywords(qData.keywords)
  },[props.qid])

  const fetchCommentList = useCallback(async() => {
    const commentList = await getCommentList(token, props.qid)
    setCommentList(commentList)
    if (commentList){
      const currentComment = commentList[commentList.length-1]
      setComment(currentComment)
    }
  },[])

  const fetchNewComment = useCallback(async () => {
    const comment = await generateComment(token, props.qid, response)
    const isSavedComment = await saveComment(token, props.qid, comment.comment) // TODO: combine generateComment + saveComment
    await fetchCommentList();
  },[fetchCommentList])


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
    const newKeywords = await generateKeywords(token, props.qid, 3)
    console.log("NEW: ", newKeywords)
    setKeywords((prevKeywords) => [...(prevKeywords || []), ...newKeywords as string[]]);
  },[token, props.qid])

  const unSelectQuestionHandler = useCallback(async () => {
    try {
      const selectedQA = await unSelectQuestion(token, props.qid)
    } catch (err) {
      console.log("Err in un-selecting question")
    }
  },[])

  const deleteQuestionHandler = useCallback(async () => {
    try {
      // TODO: implement
    } catch (err) {

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
    fetchCommentList(); // TODO: fetchComment is sometimes called without any event
  },[])

  useEffect(() => {
    if (isActive) {
      const handle = setTimeout(saveResponse, 1000);
      return () => clearTimeout(handle);
    }
  }, [response, isActive, saveResponse]);


  return (
    <div className="border-2 border-[#B9DBDC]-600 p-3 rounded-lg my-3">
      <div className="pb-2 pl-1"> {question} </div>
        <Row justify="space-between">
          <Col span={15}>
            <TextArea 
            value={response}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="자유롭게 적어보아요"
            />
          </Col>
          <Col span={8} className="">
            {/* <Button onClick={() => fetchComment()}>Comment</Button> */}
            <div className="bg-[#F1F8F8] p-3 rounded-lg text-xs flex flex-col">
              <div className="pb-3">{comment}</div>
              {comment? <Button type="text" icon={<ReloadOutlined />} onClick={() => fetchNewComment()}size="small" className="text-xs self-end">새로운 도움말 보기</Button>:"Loading comment"}
            </div>
          </Col>
        </Row>
        <Row className="mt-2">
          <div className={"border-dashed border-2 rounded-lg p-2 w-full"}>
            <div className="text-xs pb-2">관련있는 단어가 있다면 눌러보아요</div>
            {(!keywords || keywords?.length == 0)?
            <Button type="text" size="small" onClick={() => {fetchKeywordsHandler()}}>생각 도우미 단어들 보기</Button>:
            <Flex wrap gap="small"  className="flex justify-center">
                {keywords && (keywords as string[]).map((keyword, i) => <div key={i} className="border border-[#B9DBDC]-600 px-2 py-1 rounded-lg">{keyword}</div>)}
                <Button type="text" className="px-2 py-1 text-black text-opacity-50" onClick={() => {fetchKeywordsHandler()}}>단어 더보기</Button>
            </Flex>
            }
          </div>
        </Row>
    </div>
  )
}

const UnselectedQuestionItem = (props:{
  qid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [question, setQuestion] = useState<string>()

  const fetchQuestionData = useCallback(async () => {
    const qData = await getQuestionData(token, props.qid)
    setQuestion(qData.question.content)
  },[props.qid])

  useEffect(() => {
    fetchQuestionData();
  },[])

  const selectQuestionHandler = useCallback(async () => {
    try {
      const selectedQA = await selectQuestion(token, props.qid)
    } catch (err) {
      console.log("Err in selecting question")
    }
  },[])

  const deleteQuestionHandler = useCallback(() => {
    try {
      // TODO: implement
    } catch (err) {

    }
  },[])

  return (
    <Flex vertical={false} align="center" justify="space-between" className="border-2 border-[#B9DBDC]-600 rounded px-5 py-2 my-2">
      {question}
      <Flex>
      <Button onClick={() => selectQuestionHandler()} icon={<PlusOutlined/>} shape="circle"/>
      <Button icon={<DeleteOutlined/>} shape="circle" className="ml-3"/>
      </Flex>
      
    </Flex>
  )
}

const SelectedQuestionList = (props: {
  tid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [questionList, setQuestionList] = useState<string[] | null>([])

  const fetchSelectedQuestionList = useCallback(async () => {
    const fetchedQuestionList = await getSelectedQuestionList(token, props.tid)
    setQuestionList(fetchedQuestionList)
  },[])

  useEffect(() => {
    fetchSelectedQuestionList();
  },[])

  return (
    <div>
      {questionList?.map(q => <SelectedQuestionItem qid={q}/>)}
    </div>
  )
}

const UnselectedQuestionList = (props: {
  tid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [questionList, setQuestionList] = useState<string[] | null>([])
  const fetchUnselectedQuestionList = useCallback(async () => {
    const fetchedQuestionList = await getUnselectedQuestionList(token, props.tid)
    setQuestionList(fetchedQuestionList)
  },[])

  const fetchMoreQuestionHandler = useCallback(async () => {
    const fetchedQuestions = await generateQuestions(token, props.tid,1)
    await fetchUnselectedQuestionList();
  },[])

  useEffect(() => {
    fetchUnselectedQuestionList();
  },[])
  return (
    <div>
      <Collapse
        defaultActiveKey={['1']}
        ghost
        items={[
        {
          key: '1',
          label: '질문들',
          children: 
          <p>
            {questionList?.map(q => <UnselectedQuestionItem qid={q}/>)}
            <Button onClick={() => {fetchMoreQuestionHandler();}}>생각거리 더보기</Button>
          </p>
        }]}
      />
    </div>
  )
}

const ThreadBox = (props: {
  tid: string
}) => {
  const token = useSelector((state) => state.auth.token) as string
  const [threadData, setThreadData] = useState<IThreadWithQuestionIds>();
  const fetchThreadData = useCallback(async () => {
    try {
      const data: IThreadWithQuestionIds = await getThreadData(token, props.tid);
      setThreadData(data);
    } catch (error) {
      console.error('Failed to fetch thread data:', error);
    }
  }, [props.tid]);

  useEffect(() => {
    fetchThreadData();   
  }, []);

  return (
    <div>
      <Card title={threadData?threadData.theme: "Theme Loading"}>
        <UnselectedQuestionList tid={props.tid}/>
        <SelectedQuestionList tid={props.tid}/>
      </Card>
    </div>
  )
}

export default ThreadBox;