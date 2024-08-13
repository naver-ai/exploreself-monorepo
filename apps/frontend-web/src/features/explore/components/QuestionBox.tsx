import { MouseEventHandler, useCallback, useEffect, useRef, useState, useTransition } from 'react';
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
import { getNewComment, getNewKeywords, questionSelectors, setQuestionShowKeywordsFlag, setRecentlyActiveQuestionId, updateQuestion, updateQuestionResponse } from '../reducer';
import { diffChars, Change } from 'diff';
import { InteractionBase, InteractionType } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { SkeletonParagraphProps } from 'antd/es/skeleton/Paragraph';
import { useTranslation } from 'react-i18next';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { ShortcutManager } from '../../../services/shortcut';
import { filter } from 'rxjs';
import { InfoPopover } from '../../../components/InfoPopover';
import { ReactTyped } from "react-typed";


const SKELETON_PARAG_PARAMS :SkeletonParagraphProps = {rows: 3,}

export const QuestionBox = (props: { qid: string }) => {
  const dispatch = useDispatch()

  const token = useSelector(state => state.auth.token)

  const question = useSelector(state => questionSelectors.selectById(state, props.qid))
  const response = question.response
  const keywords = question.keywords
  const comment = question.aiGuides.length > 0 ? question.aiGuides[question.aiGuides.length-1].content : null;
  const [lastSavedResponse, setLastSavedResponse] = useState('');
  const [isInputFieldActive, setIsInputFieldActive] = useState(false);
  const isQuestionBoxActive = useSelector(state => state.explore.recentlyActiveQuestionId == props.qid)
  const isCreatingComment = useSelector(state => state.explore.questionCommentCreationLoadingFlags[props.qid] || false)
  const isCreatingKeywords = useSelector(state => state.explore.questionKeywordCreationLoadingFlags[props.qid] || false)

  const viewRef = useRef<HTMLDivElement>(null)
  const textFieldRef = useRef<TextAreaRef>(null)

  const [t] = useTranslation()

  const getNewKeywordsHandler = useCallback((opt: number=2) => {
    dispatch(getNewKeywords(props.qid, opt))
  },[props.qid])

  useEffect(() => {
    if (!keywords.length) {
      getNewKeywordsHandler()
    }
  },[keywords])

  const getNewCommentHandler = useCallback(() => {
    dispatch(getNewComment(props.qid, response))
  },[props.qid, response])

  const determineChangeType = (prevText: string, newText: string) => {
    const diffs: Change[] = diffChars(prevText, newText);
    diffs.forEach( (part) => {
      if (part.added) {
        return {
          type: InteractionType.UpdateInResponse,
          data: {type: 'insert', delta: part.value, prevText: prevText, newText: newText},
          metadata: {qid: props.qid}
        }
      } else if (part.removed) {
        return {
          type: InteractionType.UpdateInResponse,
          data: {type: 'delete', delta: part.value, prevText: prevText, newText: newText},
          metadata: {qid: props.qid}
        }
      }
    });
    if (prevText !== newText) {
      return {
        type: InteractionType.UpdateInResponse,
        data: {type: 'edit', delta: "", prevText: prevText, newText: newText},
        metadata: {qid: props.qid}
      }
    }
  };

  const importKeyword = useCallback(async (keyword: string) => {
    try {
      const interaction: InteractionBase = {type: InteractionType.ImportKeyword, data: {keyword: keyword}, metadata: {qid: props.qid}}
      await dispatch(updateQuestionResponse(props.qid, response.concat(keyword), interaction))
    } catch (err) {
      console.error("Failed to import keyword")
    }
  },[props.qid, response])

  const saveResponse = useCallback(async () => {
    if (response !== lastSavedResponse) {
      try {
        const interaction: InteractionBase = determineChangeType(lastSavedResponse, response) as InteractionBase
        await dispatch(updateQuestionResponse(props.qid, response, interaction))
        setLastSavedResponse(response);
      } catch (error) {
        console.error('Failed to save content:', error);
      } finally {
      }
    }
  }, [response, props.qid, lastSavedResponse]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateQuestion({_id: props.qid, response: event.target.value}))
    setIsInputFieldActive(true);
  };

  const handleFocus = async () => {
    setIsInputFieldActive(true);
    dispatch(setRecentlyActiveQuestionId(props.qid))
    if(token){
      await postInteractionData(token, InteractionType.UserFocusQuestion, {currentResponse: response}, {qid: props.qid})
    }
  };

  const handleBlur = async () => {
    setIsInputFieldActive(false);
    if(token){
      await postInteractionData(token, InteractionType.UserBlurQuestion, {currentResponse: response}, {qid: props.qid})
    }
  };
  const isQuestionKeywordsShown = useSelector(state => state.explore.questionShowKeywordsFlags[props.qid] || false)

  const handleToggleChange = async (checked: boolean) => {
    dispatch(setQuestionShowKeywordsFlag({ qid: props.qid, flag: checked }));
    if(token){
      await postInteractionData(token, InteractionType.UserToggleKeywords, {flag: checked, currentResponse: response, keywords }, {qid: props.qid})
    }
  }

  const onQuestionBoxClickCapture = useCallback<MouseEventHandler<HTMLDivElement>>((ev)=>{
    dispatch(setRecentlyActiveQuestionId(props.qid))
    if(ev.nativeEvent.target != textFieldRef.current?.resizableTextArea?.textArea){
      textFieldRef.current?.resizableTextArea?.textArea?.focus({})
    }
    requestAnimationFrame(()=>{
      textFieldRef.current?.resizableTextArea?.textArea?.scrollIntoView({behavior: 'smooth', block: 'center'})
    })
    
  }, [props.qid])


  useEffect(() => {
    if (isInputFieldActive) {
      const handle = setTimeout(saveResponse, 1000);
      return () => clearTimeout(handle);
    }
  }, [response, isInputFieldActive, saveResponse]);

  useEffect(() => { 
    if(question.aiGuides.length === 0) {
      getNewCommentHandler()
    } 
  },[])

  useEffect(()=>{
    const focusRequestSubscription = ShortcutManager.instance.onFocusRequestedEvent.pipe(filter(val => val.type == 'question' && val.id == props.qid)).subscribe({
      next: (args) => {
        requestAnimationFrame(()=>{
          viewRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
        })
        
      }
    })

    return () => {
      focusRequestSubscription.unsubscribe()
    }
  }, [props.qid])

  const switch_id = `switch-qk-${props.qid}`

  return (
    <div ref={viewRef} className={`p-3 rounded-lg my-6 first:mt-0 border border-transparent transition-all ${isQuestionBoxActive === true ? "!border-gray-300 shadow-2xl bg-white" : "bg-slate-50/25"}`} onClickCapture={onQuestionBoxClickCapture}>
      <Flex vertical={false}>
        <div className="pb-2 pl-1"><span className='text-teal-500 text-3xl font-light italic'>Q.</span> {question.question.content} </div>
      </Flex>
       {<Row>
        <div className={`transition-all border-dashed ${isQuestionKeywordsShown ? "bg-transparent" : "bg-transparent"} rounded-lg p-2 w-full mb-2`}>
          <div className='flex items-center gap-x-2 mb-2 last:mb-0'>
            <Switch id={switch_id} defaultChecked checked={isQuestionKeywordsShown} onChange={handleToggleChange}/><label className='select-none text-sm cursor-pointer' htmlFor={switch_id}>{t("Thread.Keywords.HelperKeywords")}</label>
            <InfoPopover title="표현을 돕는 단어들" content='생각이 쉽게 나지 않을 때 눌러보세요. 머릿속으로부터 표현이나 생각을 끄집어내주는 단어들을 보여줄거에요.'/>
          </div>
          {isQuestionKeywordsShown && <Flex wrap gap="small" className="flex items-center">
            {keywords &&
              (keywords as string[]).map((keyword, i) => (
                <Button
                  key={i}
                  className="border border-[#B9DBDC]-600 px-2 py-1 rounded-lg"
                  onClick={() => importKeyword(keyword)}
                >
                  {keyword}
                </Button>
              ))}
            {
              isCreatingKeywords == true? <LoadingIndicator title={t("Thread.Keywords.Generating")} className='ml-2'/> : <Button
              type="text"
              className="px-2 py-1 text-black text-opacity-50"
              onClick={() => {
                getNewKeywordsHandler(1);
              }}
            >
              {t("Thread.Keywords.More")}
            </Button>
            }
          </Flex>}
        </div>
      </Row>
      }
      <Row justify="space-between">
        <Col span={15}>
          <TextArea
            ref={textFieldRef}
            autoFocus
            value={response}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={t("Thread.Questions.AnswerPlaceholder")}
            className='minimal dimmed !min-h-full'
            data-enable-grammarly={false}
            autoSize={{ minRows: 2 }}
          />
        </Col>
        <Col span={8} className="">
          <div className="bg-[#F1F8F8] p-3 rounded-lg text-xs flex flex-col leading-7">
            <div>
              <InfoPopover title="도움말" content={`어떻게 이어서 적어나가야할지 막막할 때 눌러보세요.\n 생각의 방향에 도움을 줄 수 있어요.`}/>
            </div>
            
            {
              isCreatingComment === true ? 
                <Skeleton className='skeleton-sm' active title={false} paragraph={SKELETON_PARAG_PARAMS} /> : 
                <>
                {comment && <ReactTyped
                  strings={[comment]}
                  typeSpeed={30}
                  backSpeed={50}
                  loop={false}
                />}    
                <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => getNewCommentHandler()}
                size="small"
                className="text-xs justify-center py-3"
              >{t("Thread.Questions.RequestHelp")}</Button>
              </>
            }
            
          </div>
        </Col>
      </Row>
    </div>
  );
};