import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Flex,
  Row,
  Col,
  Skeleton,
  Switch
} from 'antd';
import {
  ReloadOutlined,
} from '@ant-design/icons';
const { TextArea } = Input;
import { useDispatch, useSelector } from '../../../redux/hooks';
import {
  updateResponse,
} from '../../../api_call/saveQASet';
import { getNewComment, getNewKeywords, questionSelectors, setQuestionShowKeywordsFlag, updateQuestion } from '../reducer';
import { diffChars, Change } from 'diff';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionBase, InteractionType } from '@core';


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

  const determineChangeType = (prevText: string, newText: string) => {
    const diffs: Change[] = diffChars(prevText, newText);
    diffs.forEach( (part) => {
      if (part.added) {
        return {
          interaction_type: InteractionType.UpdateInResponse,
          interaction_data: {type: 'insert', delta: part.value, prevText: prevText, newText: newText},
          metadata: {qid: props.qid}
        }
      } else if (part.removed) {
        return {
          interaction_type: InteractionType.UpdateInResponse,
          interaction_data: {type: 'delete', delta: part.value, prevText: prevText, newText: newText},
          metadata: {qid: props.qid}
        }
      }
    });
    if (prevText !== newText) {
      return {
        interaction_type: InteractionType.UpdateInResponse,
        interaction_data: {type: 'edit', delta: "", prevText: prevText, newText: newText},
        metadata: {qid: props.qid}
      }
    }
  };

  const saveResponse = useCallback(async () => {
    if (response !== lastSavedResponse) {
      setIsSaving(true);
      try {
        const interaction: InteractionBase = determineChangeType(lastSavedResponse, response) as InteractionBase
        const savedQA = await updateResponse(token, props.qid, response, interaction);
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
  const isQuestionKeywordsShown = useSelector(state => state.explore.questionShowKeywordsFlags[props.qid] || false)

  const handleToggleChange = useCallback((checked: boolean) => {
    dispatch(setQuestionShowKeywordsFlag({ qid: props.qid, flag: !checked }));
  }, [dispatch, props.qid]);

  useEffect(() => {
    if (isActive) {
      const handle = setTimeout(saveResponse, 1000);
      return () => clearTimeout(handle);
    }
  }, [response, isActive, saveResponse]);


  return (
    <div className="border-2 border-[#B9DBDC]-600 p-3 rounded-lg my-3">
      <Flex vertical={false}>
        <div className="pb-2 pl-1"> {question.question.content} </div>
        {/* <Switch className="" checkedChildren="단어 도우미" unCheckedChildren="단어 도우미" defaultChecked checked={isQuestionKeywordsShown} onChange={() => handleToggleChange(isQuestionKeywordsShown as boolean)}/> */}
      </Flex>
      <Switch className="mb-1" checkedChildren="단어 도우미" unCheckedChildren="단어 도우미" defaultChecked checked={isQuestionKeywordsShown} onChange={() => handleToggleChange(isQuestionKeywordsShown as boolean)}/>
      {isQuestionKeywordsShown && 
      <Row>
        <div className={'border-dashed border-2 rounded-lg p-2 w-full mb-2'}>
          <div className="text-xs pb-2">생각을 돕는 단어들</div>
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
      }
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
    </div>
  );
};