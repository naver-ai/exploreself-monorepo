import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OutlinePanel, PinnedThemesPanel } from '../components/sidebar-views';
import ThemeBox from '../components/ThemeBox';
import { ThreadBox } from '../components/ThreadBox';
import { Card,  Button, Drawer, Space, Carousel, Input } from 'antd';
const {TextArea} = Input;
import { useDispatch, useSelector } from '../../../redux/hooks';
import { Navigate } from 'react-router-dom';
import { UserAvatar } from '../components/UserAvatar';
import { getNewSynthesis, setThemeSelectorOpen, threadSelectors } from '../reducer';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';
import { ShortcutManager } from '../../../services/shortcut';
import useScrollbarSize from 'react-scrollbar-size';
import {AlignLeftOutlined} from '@ant-design/icons'
import { useTranslation } from 'react-i18next';

const SidePanel = () => {
  const [open, setOpen] = useState(false)
  const synthesisList: string[] = useSelector(state => state.explore.synthesis)
  const isCreatingSynthesis = useSelector(state => state.explore.isCreatingSynthesis)

  const dispatch = useDispatch();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const generateSynthesis = useCallback(async () => {
    dispatch(getNewSynthesis())
  },[])

  useEffect(() => {
    if(open) {
      if(!synthesisList || synthesisList.length == 0) {
        generateSynthesis()
      }
    }
  },[open])


  return (
    <>
      <div
        id="sidebar-header"
        className="flex justify-between p-3 items-center  border-b-[1px]"
      >
        <span className="text-sm font-black">MeSense</span>
        <UserAvatar buttonClassName="" />
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-400/2">
        <OutlinePanel />
        <PinnedThemesPanel />
        <div className='w-full flex justify-end '>
          <Button onClick={showDrawer} icon={<AlignLeftOutlined/>}>AI 요약 보기</Button>
        </div>
        
        <Drawer
          onClose={onClose}
          open={open}
          placement="bottom"
          title="AI 요약"
          // closeIcon={false}
          extra={
            <Space>
              <Button onClick={() => generateSynthesis()}>{isCreatingSynthesis? "요약중입니다": "새로운 요약 보기"}</Button>

            </Space>
          }
        >
          <Carousel 
            arrows
            className='custom-carousel h-full'
            initialSlide={synthesisList?.length-1}
          >
            {synthesisList.map((item, i) => 
            <div className='rounded-lg' key={i}>
              <div className='px-20 pb-10 leading-loose'>
                <div className='flex justify-end pb-3'>
                  {item}
                </div>
              </div>
            </div>)}
            {isCreatingSynthesis && "Is creating synthesis"}
          </Carousel>
          
        </Drawer>
      </div>
    </>
  );
};

export const ExplorerPage = () => {

  const [t] = useTranslation()

  const initialNarrative = useSelector(
    (state) => state.explore.initialNarrative
  );
  const userName = useSelector((state) => state.explore.name);
  const threadIds = useSelector(threadSelectors.selectIds);

  const floatingHeader = useSelector(state => state.explore.floatingHeader)

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });

  const dispatch = useDispatch();

  const onThemeSelectionButtonClick = useCallback(() => {
    dispatch(setThemeSelectorOpen(true));
  }, []);

  const scrollViewRef = useRef<HTMLDivElement>(null);

  const narrativeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusRequestSubscription =
      ShortcutManager.instance.onFocusRequestedEvent.subscribe((event) => {
        switch (event.type) {
          case 'narrative':
            {
              scrollViewRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }
            break;
        }
      });

    return () => {
      focusRequestSubscription.unsubscribe();
    };
  }, []);

  const {width: scrollBarWidth} = useScrollbarSize()

  const scrollbarSafeRightStyle = useMemo(()=>{
    return {right: scrollBarWidth}
  }, [scrollBarWidth])

  if (userName == null || userName.length == 0) {
    return <Navigate to="/app/profile" />;
  } else if (initialNarrative == null || initialNarrative.length == 0) {
    return <Navigate to="/app/narrative" />;
  } else
    return (
      <div className="h-screen flex justify-stretch">
        <div className="basis-1/6 min-w-[200px] lg:min-w-[300px] bg-white border-r-[1px] flex flex-col">
          <SidePanel />
        </div>
        <div className="flex-1 relative">
          {(floatingHeader != null) && (
          <div className="absolute top-0 left-0 z-50 animate-slidein-down" style={scrollbarSafeRightStyle}>
            <div className="container px-4 md:px-8">
              <div className="px-6 border-b  bg-white/80 border-gray-200 text-black py-4 text-lg font-bold shadow-lg backdrop-blur-sm">{floatingHeader}</div>
            </div>
          </div>
        )}
          <div
            className="overflow-y-scroll h-screen overflow-x-hidden"
            ref={scrollViewRef}
          >
            <ThemeBox />
            <div className="container px-4 md:px-8 py-4 md:py-8 relative">
              <Card ref={narrativeCardRef} title={t("Narrative.InitialNarrative")}>
                <span className="text-gray-600 leading-7">
                  {initialNarrative}
                </span>
              </Card>
              {
                threadIds.map((threadId) => (
                  <ThreadBox key={threadId} tid={threadId}/>
                ))
              }
              <Button
                key={'new-theme-btn-bottom'}
                ref={ref}
                type="primary"
                className="w-full border-none shadow-lg h-12 mt-4"
                icon={<LightBulbIcon className="w-5 h-5" />}
                onClick={onThemeSelectionButtonClick}
              >
                <span>다른 주제 탐색하기</span>
              </Button>
            </div>

            {inView === false ? (
              <div className="absolute bottom-0 left-0 px-4 mx:px-8 bg-gradient-to-t from-white to-white/0 py-8" style={scrollbarSafeRightStyle}>
                <div className="container">
                  <Button
                    type="primary"
                    className="w-full border-none h-12 mt-4 shadow-lg shadow-teal-900/50 animate-slidein-up"
                    icon={<LightBulbIcon className="w-5 h-5" />}
                    onClick={onThemeSelectionButtonClick}
                  >
                    <span>다른 주제 탐색하기</span>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
};
