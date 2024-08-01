import { useCallback, useEffect, useState, useRef } from 'react';
import {
  Button,
  Input,
  Card,
  Flex,
  Collapse,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
const { TextArea } = Input;
import { useDispatch, useSelector } from '../../../redux/hooks';
import { ShortcutManager } from '../../../services/shortcut';
import { questionSelectors, selectedQuestionIdsSelector, selectQuestion, threadSelectors, unSelectedQuestionIdsSelector } from '../reducer';
import { useInView } from 'react-intersection-observer';
import { QuestionBox } from './QuestionBox';


const UnselectedQuestionItem = (props: { qid: string }) => {

  const question = useSelector(state => questionSelectors.selectById(state, props.qid))

  const dispatch = useDispatch();

  const selectQuestionHandler = useCallback(async () => { //TODO move this to redux-based
    try {
      //const selectedQA = await selectQuestion(token, props.qid);
      dispatch(selectQuestion(props.qid))
    } catch (err) {
      console.log('Err in selecting question');
    }
  }, [props.qid]);

  const deleteQuestionHandler = useCallback(() => {
    try {
      // TODO: implement
    } catch (err) {}
  }, []);

  return (
    <Flex
      vertical={false}
      align="center"
      justify="space-between"
      className="border-[1px] shadow border-[#B9DBDC]-600 rounded-lg px-5 py-2 my-2"
    >
      {question?.question?.content}
      <Flex>
        <Button
          onClick={() => selectQuestionHandler()}
          icon={<PlusOutlined />}
          shape="circle"
        />
        <Button icon={<DeleteOutlined />} shape="circle" className="ml-3" />
      </Flex>
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


  const questionIds = useSelector(state => unSelectedQuestionIdsSelector(state, props.tid))
  

  //const fetchMoreQuestionHandler = useCallback(async () => { //TODO move this to redux-based
    //const fetchedQuestions = await generateQuestions(token, props.tid, 1);
    //await fetchUnselectedQuestionList();
  //}, [fetchUnselectedQuestionList]);

  return (
    <div>
      <Collapse
        defaultActiveKey={['1']}
        ghost
        items={[
          {
            key: '1',
            label: '질문들',
            children: (
              <p>
                {questionIds.map((qid) => (
                  <UnselectedQuestionItem qid={qid} />
                ))}
                <Button
                  onClick={() => {
                    //fetchMoreQuestionHandler(); //TODO fix this
                  }}
                >
                  생각거리 더보기
                </Button>
              </p>
            ),
          },
        ]}
      />
    </div>
  );
};

export const ThreadBox = (props: { tid: string }) => {

  const thread = useSelector(state => threadSelectors.selectById(state, props.tid))

  const isCreatingQuestions = useSelector(state => state.explore.threadQuestionCreationLoadingFlags[props.tid] || false)

  const [ref, inView, entry] = useInView({
    threshold: [0,1],
    rootMargin: '0px 0px -100% 0px',
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

  const isIntersectingTop = entry?.isIntersecting && entry.boundingClientRect && entry.boundingClientRect.top <= 0;

  return (
    <div ref={ref} className='relative'>
      {isIntersectingTop && (
        <div className="fixed top-0 w-full bg-white z-50 border-b border-gray-200 text-black py-3 pl-3 ">
          <div className="text-lg font-medium pl-3">{thread.theme}</div>
        </div>
      )}
      <Card
        title={thread.theme}
        className="mt-4 relative"
      >
        <div
          ref={scrollAnchorRef}
          className="scroll-anchor absolute -top-6 w-10 h-10"
        />

        {
          isCreatingQuestions === true ? <Spin>Generating questions...</Spin> : <>
            <SelectedQuestionList tid={props.tid} />
            <UnselectedQuestionList tid={props.tid} />
          </>
        }
      </Card>
    </div>
    
  );
};
