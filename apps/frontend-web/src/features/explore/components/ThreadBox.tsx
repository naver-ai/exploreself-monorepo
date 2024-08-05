import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  Button,
  Input,
  Card,
  Flex,
  Collapse,
  Spin,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
const { TextArea } = Input;
import { useDispatch, useSelector } from '../../../redux/hooks';
import { ShortcutManager } from '../../../services/shortcut';
import { getMoreQuestion, questionSelectors, selectedQuestionIdsSelector, selectQuestion, setFloatingHeaderFlag, threadSelectors, unSelectedQuestionIdsSelector } from '../reducer';
import { useInView } from 'react-intersection-observer';
import { QuestionBox } from './QuestionBox';
import { usePrevious } from "@uidotdev/usehooks";
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { PencilIcon } from '@heroicons/react/20/solid';


const UnselectedQuestionItem = (props: { qid: string }) => {

  const question = useSelector(state => questionSelectors.selectById(state, props.qid))

  const dispatch = useDispatch();

  const deleteQuestionHandler = useCallback(() => {
    try {
      // TODO: implement
    } catch (err) {}
  }, []);

  const onSelect = useCallback(() => dispatch(selectQuestion(props.qid)), [props.qid])

  return (
    <Flex
      vertical={false}
      align="center"
      justify="space-between"
      className="group border-b-[1px] pl-5 py-2 hover:bg-slate-200/50 cursor-pointer"
      onClick={onSelect}
    >
      <span className='my-2'>{question?.question?.content}</span>
      {<Flex>
        <Button className='pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={onSelect}
          icon={<PencilIcon className='w-4 h-4'/>}
          type="primary"
        >답변 쓰기</Button>
        {false && <Button type="text" icon={<DeleteOutlined />} shape="circle" className="ml-3" />}
      </Flex>}
    </Flex>
  );
};

const SelectedQuestionList = (props: { tid: string }) => {
  const questionIds = useSelector(state => selectedQuestionIdsSelector(state, props.tid))
  
  return (
    <div>
      {questionIds.map((qid) => (
        <QuestionBox qid={qid} />
      ))}
    </div>
  );
};

const UnselectedQuestionList = (props: { tid: string }) => {

  const dispatch = useDispatch();
  const questionIds = useSelector(state => unSelectedQuestionIdsSelector(state, props.tid))
  const isCreatingQuestions = useSelector(state => state.explore.threadQuestionCreationLoadingFlags[props.tid] || false)

  const onMoreQuestionsClick = useCallback(() => {
    dispatch(getMoreQuestion(props.tid))
  }, [props.tid])

  const items = useMemo(()=>{
    return [
      {
        key: '1',
        label: <span className='font-semibold select-none text-base'>{t("Thread.Questions.Title")} ({questionIds.length}개)</span>,
        children: (
          <p>
            {
              questionIds.map((qid) => (
                <UnselectedQuestionItem key={qid} qid={qid} />
              ))
            }
            {
              !isCreatingQuestions ? <div className='text-right pt-3'>
                  <Button className='' disabled={isCreatingQuestions} onClick={onMoreQuestionsClick}>{t("Thread.Questions.More")}</Button>
                </div> : null
            }
            
          </p>
        ),
      },
    ]
  }, [questionIds, onMoreQuestionsClick, isCreatingQuestions, t])

  return questionIds.length > 0 || isCreatingQuestions == false ? <Collapse
        className='bg-slate-100'
        defaultActiveKey={['1']}
        ghost
        items={items}
      /> : null
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

  const isCreatingQuestions = useSelector(state => state.explore.threadQuestionCreationLoadingFlags[props.tid] || false)

  const [t] = useTranslation()

  const [ref, inView, entry] = useInView({
    threshold: THRESHOLDS,
  })

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusRequestSubscription =
      ShortcutManager.instance.onFocusRequestedEvent.subscribe((event) => {
        if (event.type == 'thread' && event.id == props.tid) {
          scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        className="mt-4 relative rounded-xl"
      >
        <div
          ref={scrollAnchorRef}
          className="scroll-anchor absolute -top-6 w-10 h-10"
        />
            <SelectedQuestionList tid={props.tid} />
            <UnselectedQuestionList tid={props.tid} />

        {
          isCreatingQuestions === true ? <LoadingIndicator title={t("Thread.Questions.Generating")} className='mt-4'/> : null
        }
      </Card>)
};
