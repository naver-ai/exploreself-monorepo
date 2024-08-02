import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Flex,
  Row,
  Col,
  Skeleton
} from 'antd';
import {
  ReloadOutlined,
} from '@ant-design/icons';
const { TextArea } = Input;
import { useDispatch, useSelector } from '../../../redux/hooks';
import {
  updateResponse,
} from '../../../api_call/saveQASet';
import { getNewComment, getNewKeywords, questionSelectors, updateQuestion } from '../reducer';


export const QuestionBox = (props: { qid: string }) => {
  const token = useSelector((state) => state.auth.token) as string;
  const dispatch = useDispatch()

  const question = useSelector(state => questionSelectors.selectById(state, props.qid))
  const comment = question.aiGuides? question.aiGuides[question.aiGuides.length -1].content: "Loading"
  const [response, setResponse] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedResponse, setLastSavedResponse] = useState('');
  const [isActive, setIsActive] = useState(false);
  const isCreatingComment = useSelector(state => state.explore.questionCommentCreationLoadingFlags[props.qid] || false)


  const getNewKeywordsHandler = useCallback((opt: number=2) => {
    dispatch(getNewKeywords(props.qid, opt))
  },[props.qid])

  const getNewCommentHandler = useCallback(() => {
    dispatch(getNewComment(props.qid, response))
  },[props.qid, response])

  const saveResponse = useCallback(async () => {
    if (response !== lastSavedResponse) {
      setIsSaving(true);
      try {
        const savedQA = await updateResponse(token, props.qid, response);
        dispatch(updateQuestion({_id: props.qid, response: response}))
        setLastSavedResponse(response);
      } catch (error) {
        console.error('Failed to save content:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [response, props.qid, lastSavedResponse]);

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
    if (isActive) {
      const handle = setTimeout(saveResponse, 1000);
      return () => clearTimeout(handle);
    }
  }, [response, isActive, saveResponse]);


  return (
    <div className="border-2 border-[#B9DBDC]-600 p-3 rounded-lg my-3">
      <div className="pb-2 pl-1"> {question.question.content} </div>
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
          <div className="bg-[#F1F8F8] p-3 rounded-lg text-xs flex flex-col">
            {
              isCreatingComment === true ? 
                <Skeleton active /> : 
                <>
                <div className="pb-3">{comment}</div>
                <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => getNewCommentHandler()}
                size="small"
                className="text-xs self-end"
              >
                새로운 도움말 보기
              </Button>
              </>
            }
          </div>
        </Col>
      </Row>
      <Row className="mt-2">
        <div className={'border-dashed border-2 rounded-lg p-2 w-full'}>
          <div className="text-xs pb-2">관련있는 단어가 있다면 눌러보아요</div>
          {!question.keywords || question.keywords?.length == 0 ? (
            <Button
              type="text"
              size="small"
              onClick={() => {
                getNewKeywordsHandler(3);
              }}
            >
              생각 도우미 단어들 보기
            </Button>
          ) : (
            <Flex wrap gap="small" className="flex justify-center">
              {question.keywords &&
                (question.keywords as string[]).map((keyword, i) => (
                  <div
                    key={i}
                    className="border border-[#B9DBDC]-600 px-2 py-1 rounded-lg"
                  >
                    {keyword}
                  </div>
                ))}
              <Button
                type="text"
                className="px-2 py-1 text-black text-opacity-50"
                onClick={() => {
                  getNewKeywordsHandler(1);
                }}
              >
                단어 더보기
              </Button>
            </Flex>
          )}
        </div>
      </Row>
    </div>
  );
};