import { useCallback, useEffect, useRef, MouseEventHandler, useState } from 'react';
import {
  Button,
  Card,
  Flex,
} from 'antd';
import {
  DeleteOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { ShortcutManager } from '../../../services/shortcut';
import { getNewQuestions, questionSelectors, selectedQuestionIdsSelector, selectQuestion, setFloatingHeaderFlag, threadSelectors } from '../reducer';
import { useInView } from 'react-intersection-observer';
import { QuestionBox } from './QuestionBox';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { ArrowDownIcon, PencilIcon } from '@heroicons/react/20/solid';
import { IQASetWithIds } from '@core';

const UnselectedQuestionItem = (props: { tid: string, qid: string, onSelectQuestion?: () => void }) => {

  const question = useSelector(state => questionSelectors.selectById(state, props.qid))

  const dispatch = useDispatch();

  const onSelect = useCallback(() =>{
    dispatch(selectQuestion(props.tid, props.qid, (q)=>{
      requestAnimationFrame(()=>{
        ShortcutManager.instance.requestFocus({type:"question", id: q._id})
      })
    }))
    if (props.onSelectQuestion) {
      props.onSelectQuestion(); 
    }
  }, [props.qid])
  const [t] = useTranslation()

  return (
    <Flex
      vertical={false}
      align="center"
      justify="space-between"
      className="group border-b-[1px] last:border-none pl-5 py-2 hover:bg-slate-200/50 cursor-pointer"
      onClick={onSelect}
    >
      <span className='my-2'>{question?.question?.content}</span>
      {<Flex>
        <Button className='pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity mx-3'
          onClick={onSelect}
          icon={<PencilIcon className='w-4 h-4'/>}
          type="primary"
        >{t("Theme.Questions.Answer")}</Button>
        {false && <Button type="text" icon={<DeleteOutlined />} shape="circle" className="mx-3" />}
      </Flex>}
    </Flex>
  );
};

const SelectedQuestionList = (props: { tid: string }) => {

  const [t] = useTranslation()

  const questionIds = useSelector(state => selectedQuestionIdsSelector(state, props.tid))
  
  const isThreadInCreation = useSelector(state=>state.agenda.threadInInitializationFlags[props.tid])

  return questionIds.length > 0 ? <div>
      {questionIds.map((qid) => (
        <QuestionBox key={qid} tid={props.tid} qid={qid} />
      ))}
    </div> : (isThreadInCreation !== true ? <div className='pb-6 pt-0 px-2 flex items-center font-base text-blue-500'>
      <ArrowDownIcon className='w-6 h-6 mr-2 animate-bounce'/>
      <span>{t("Theme.Questions.NoQuestionPlaceholder")}</span>
    </div> : null)
};

const NewQuestionList = (props: {tid: string}) => {
  const [t] = useTranslation()

  const dispatch = useDispatch();
  const isCreatingQuestions = useSelector(state => state.agenda.threadQuestionCreationLoadingFlags[props.tid] || false)
  const selectedQuestionIds = useSelector(state => selectedQuestionIdsSelector(state, props.tid))
  const [isQSelectorOpen, setIsQSelectorOpen] = useState<boolean>(true)
  const [questions, setQuestions] = useState<Array<IQASetWithIds>>([])

  const _handleGetQuestions = useCallback(async () => {
    const newQuestions = await dispatch(getNewQuestions(props.tid, 3, questions.map(q => q.question.content))) as IQASetWithIds[]
    console.log("newQuestions:", newQuestions)
    
    const newQuestionList = [...questions, ...newQuestions]
    setQuestions(newQuestionList)
    setIsQSelectorOpen(true)
  },[props.tid, questions])

  const handleGetQuestions = useCallback<MouseEventHandler<HTMLElement>>(async (ev) => {
    ev.stopPropagation()
    _handleGetQuestions()
  },[props.tid, questions])

  const handleMoreQuestions = useCallback<MouseEventHandler<HTMLElement>>(async (ev) => {
    ev.stopPropagation()
    const newQuestions = await dispatch(getNewQuestions(props.tid, 1, questions.map(q => q.question.content))) as IQASetWithIds[]
    const newQuestionList = [...questions, ...newQuestions]
    setQuestions(newQuestionList)
  },[props.tid, questions])

  const moreButton = <Button className='' disabled={isCreatingQuestions} onClick={handleMoreQuestions}>{t("Theme.Questions.More")}</Button>
  const newButton = <Button className='' type='primary' disabled={isCreatingQuestions} onClick={handleGetQuestions}>{t("Theme.Questions.NewQuestion")}</Button>

  const handleQuestionSelect = useCallback(() => {
    setIsQSelectorOpen(false); 
    setQuestions([]);
  }, []);

  useEffect(() => {
    if(isQSelectorOpen && selectedQuestionIds.length === 0) {
      _handleGetQuestions()
    }
  },[isQSelectorOpen])

  return (
    <>
    {!isQSelectorOpen? 
    <div>
      {newButton}
      {isCreatingQuestions && <LoadingIndicator title={t("Theme.Questions.Generating")}/>}
    </div>
    :
    <div>
      {isCreatingQuestions? 
      <LoadingIndicator title={t("Theme.Questions.Generating")}/>:
      <div className="flex justify-end mb-2">
        {moreButton}
      </div>
      }
      {[...questions].reverse().map((q) => (<UnselectedQuestionItem key={q._id} tid={q.tid} qid={q._id} onSelectQuestion={() => handleQuestionSelect()}/>))}
    </div>}
    </>
  )
}

function buildThresholdList(numSteps: number): Array<number> {
  let thresholds = [];

  for (let i = 1.0; i <= numSteps; i++) {
    let ratio = i / numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}
const THRESHOLDS = buildThresholdList(20)

export const ThreadBox = (props: { tid: string }) => {

  const dispatch = useDispatch()

  const thread = useSelector(state => threadSelectors.selectById(state, props.tid))

  const [ref, inView, entry] = useInView({
    threshold: THRESHOLDS,
  })

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const isHoveringInOutline = useSelector(state => state.agenda.hoveringOutlineThreadId == props.tid)

  useEffect(() => {
    const focusRequestSubscription =
      ShortcutManager.instance.onFocusRequestedEvent.subscribe((event) => {
        if (event.type == 'thread' && event.id == props.tid) {
          scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

    return () => {
      focusRequestSubscription.unsubscribe();
    };
  }, [props.tid]);

  useEffect(()=>{
    const isIntersectingTop = entry?.isIntersecting === true && entry.boundingClientRect && entry.boundingClientRect.top < -20 && entry.boundingClientRect.bottom > 64;
    dispatch(setFloatingHeaderFlag({tid: props.tid, intersecting: isIntersectingTop}))
  }, [props.tid, entry?.isIntersecting, entry?.boundingClientRect?.top, entry?.boundingClientRect?.bottom, inView])

  return (<Card
        ref={ref}
        title={<span className='font-bold'>{thread.theme}</span>}
        className={`mt-4 relative rounded-xl transition-all outline outline-0 outline-orange-300 ${isHoveringInOutline === true ? 'outline outline-2 ' : ''}`}
      >
        <div
          ref={scrollAnchorRef}
          className="scroll-anchor absolute -top-6 w-10 h-10"
        />
            <SelectedQuestionList tid={props.tid} />
            <NewQuestionList tid={props.tid}/>
      </Card>)
};
