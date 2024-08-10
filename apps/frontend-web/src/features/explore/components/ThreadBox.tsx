import { useCallback, useEffect, useRef, useMemo, MouseEventHandler, useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Collapse,
} from 'antd';
import {
  DeleteOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { ShortcutManager } from '../../../services/shortcut';
import { getMoreQuestion, questionSelectors, selectedQuestionIdsSelector, selectQuestion, setFloatingHeaderFlag, threadSelectors, unSelectedQuestionIdsSelector } from '../reducer';
import { useInView } from 'react-intersection-observer';
import { QuestionBox } from './QuestionBox';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { ArrowDownIcon, PencilIcon } from '@heroicons/react/20/solid';
import { usePrevious } from "@uidotdev/usehooks";

const UnselectedQuestionItem = (props: { qid: string }) => {

  const question = useSelector(state => questionSelectors.selectById(state, props.qid))

  const dispatch = useDispatch();

  const deleteQuestionHandler = useCallback(() => {
    try {
      // TODO: implement
    } catch (err) {}
  }, []);

  const onSelect = useCallback(() =>{
    dispatch(selectQuestion(props.qid, (q)=>{
      requestAnimationFrame(()=>{
        ShortcutManager.instance.requestFocus({type:"question", id: q._id})
      })
    }))}, [props.qid])
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
        <Button className='pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={onSelect}
          icon={<PencilIcon className='w-4 h-4'/>}
          type="primary"
        >{t("Thread.Questions.Answer")}</Button>
        {false && <Button type="text" icon={<DeleteOutlined />} shape="circle" className="ml-3" />}
      </Flex>}
    </Flex>
  );
};

const SelectedQuestionList = (props: { tid: string }) => {

  const [t] = useTranslation()

  const questionIds = useSelector(state => selectedQuestionIdsSelector(state, props.tid))
  
  const isThreadInCreation = useSelector(state=>state.explore.threadInInitializationFlags[props.tid])

  return questionIds.length > 0 ? <div>
      {questionIds.map((qid) => (
        <QuestionBox key={qid} qid={qid} />
      ))}
    </div> : (isThreadInCreation !== true ? <div className='pb-6 pt-0 px-2 flex items-center font-base text-blue-500'>
      <ArrowDownIcon className='w-6 h-6 mr-2 animate-bounce'/>
      <span>{t("Thread.Questions.NoQuestionPlaceholder")}</span>
    </div> : null)
};

const UnselectedQuestionList = (props: { tid: string }) => {

  const [t] = useTranslation()

  const dispatch = useDispatch();
  const questionIds = useSelector(state => unSelectedQuestionIdsSelector(state, props.tid))
  const isCreatingQuestions = useSelector(state => state.explore.threadQuestionCreationLoadingFlags[props.tid] || false)
  const prevCreatingQuestions = usePrevious(isCreatingQuestions)

  const [isPanelExpanded, setIsPanelExpanded] = useState(true)

  const onMoreQuestionsClick = useCallback<MouseEventHandler<HTMLElement>>((ev) => {
    ev.stopPropagation()
    dispatch(getMoreQuestion(props.tid))
  }, [props.tid])

  useEffect(()=>{
    if(prevCreatingQuestions != isCreatingQuestions && isCreatingQuestions == false){

    }
  }, [prevCreatingQuestions, isCreatingQuestions])

  const moreButton = <Button className='' disabled={isCreatingQuestions} onClick={onMoreQuestionsClick}>{t("Thread.Questions.More")}</Button>


  const items = useMemo(()=>{
    return [
      {
        key: '1',
        label: <div className='flex items-center justify-between'>
              <span className='font-semibold select-none text-base'>{t("Thread.Questions.Title")} ({questionIds.length}){t("Labels.Count")}</span>
              {
            isCreatingQuestions === false ? (isPanelExpanded === true ? moreButton : null) : <LoadingIndicator className='!justify-end' title={t("Thread.Questions.Generating")}/>
            }
          </div>,
        children: (
            <div>
            {
              questionIds.map((qid) => <UnselectedQuestionItem key={qid} qid={qid} />)
            }</div>
        ),
      },
    ]
  }, [questionIds, onMoreQuestionsClick, isCreatingQuestions, t, isPanelExpanded])

  const onPanelChange =useCallback((key: string | string[])=>{
    if(key == '1'){
      setIsPanelExpanded(true)
    }else{
      setIsPanelExpanded(false)
    }
  }, [])

  return <>
  {
    questionIds.length > 0 ?<Collapse
        onChange={onPanelChange}
        className='bg-slate-100'
        defaultActiveKey={1}
        activeKey={isPanelExpanded ? 1 : undefined}
        ghost
        items={items}
      /> : (!isCreatingQuestions ? moreButton : <LoadingIndicator title={t("Thread.Questions.Generating")}/>)}</>
};

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

  const isHoveringInOutline = useSelector(state => state.explore.hoveringOutlineThreadId == props.tid)

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
            <UnselectedQuestionList tid={props.tid} />
      </Card>)
};
