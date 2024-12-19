import { useCallback, useEffect, useMemo, useRef } from 'react';
import { OutlinePanel, PinnedThemesPanel } from '../components/sidebar-views';
import ThemeBox from '../components/ThemeBox';
import { ThreadBox } from '../components/ThreadBox';
import { Card,  Button, Input } from 'antd';
const {TextArea} = Input;
import { useDispatch, useSelector } from '../../../redux/hooks';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserAvatar } from '../../user/components/UserAvatar';
import {enterReviewStage, getNewThemes, resetNewThemes, selectFloatingHeader, setThemeSelectorOpen, threadSelectors } from '../reducer';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';
import { ShortcutManager } from '../../../services/shortcut';
import useScrollbarSize from 'react-scrollbar-size';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames'
import { SessionStatus } from '@core';
import { InfoPopover } from '../../../components/InfoPopover';


const SidePanel = () => {

  const dispatch = useDispatch();
  const isThemeSelectorOpen = useSelector(state => state.agenda.isThemeSelectorOpen)
  const [t] = useTranslation()
  const navigate = useNavigate();

  const handleEndSession = useCallback(async () => {
    await dispatch(enterReviewStage())
    navigate("./summary")
  },[])

  return (
    <>
      <div
        id="sidebar-header"
        className="flex justify-between p-3 items-center  border-b-[1px]"
      >
        <span className="text-sm font-black">ExploreSelf</span>
        <UserAvatar  disabled={isThemeSelectorOpen} buttonClassName="" />
      </div>
      <div className={classNames(
        'flex-1 overflow-y-auto bg-gray-400/2',
        {
          'pointer-events-none opacity-50': isThemeSelectorOpen,
        },
        {
          'opacity-100': !isThemeSelectorOpen,
        }
      )}>
        <OutlinePanel />
        {false && <PinnedThemesPanel />}
      </div>
      <div className='border-t p-2 shadow-slate-600 shadow-2xl'>
        <Button disabled={isThemeSelectorOpen} className='w-full' onClick={handleEndSession}>{t("Summary.Open")}<InfoPopover title="AI 요약 보기" content='지금까지 적어본 것들에 대한 AI 요약을 확인해볼 수 있어요.'/></Button>
      </div>
    </>
  );
};

export const ExplorerPage = () => {

  const [t] = useTranslation()

  const initialNarrative = useSelector(
    (state) => state.agenda.initialNarrative
  );

  const sessionStatus = useSelector(state => state.agenda.sessionStatus)

  const threadIds = useSelector(threadSelectors.selectIds);

  const isThemeSelectorOpen = useSelector(state => state.agenda.isThemeSelectorOpen)

  const floatingHeader = useSelector(selectFloatingHeader)

  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
  });

  const dispatch = useDispatch();

  const onThemeSelectionButtonClick = useCallback(() => {
    dispatch(resetNewThemes())
    dispatch(getNewThemes(3))
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

  const focusOnThemeButton = threadIds.length === 0 && isThemeSelectorOpen === false

  if (sessionStatus == SessionStatus.Reviewing || sessionStatus == SessionStatus.Terminated){
    return <Navigate to="./summary"/>;
  } else {
    const themeButtonIcon = <LightBulbIcon className={`w-5 h-5 ${focusOnThemeButton ? "animate-bounce-emphasized text-yellow-200":""}`} />
    const themeButtonLabel = <span className={`${focusOnThemeButton ? 'animate-pulse font-semibold':''}`}>{threadIds.length == 0 ? t("Exploration.ShowMoreThemesInitial") : t("Exploration.ShowMoreThemes")}</span>
    return (
      <div className="h-screen flex justify-stretch">
        <div className="basis-1/6 min-w-[200px] md:min-w-[300px] bg-white border-r-[1px] flex flex-col">
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
                className={`w-full border-none shadow-lg h-12 mt-4 ${focusOnThemeButton ? 'outline animate-focus-indicate':''}`}
                icon={themeButtonIcon}
                onClick={onThemeSelectionButtonClick}
              >{themeButtonLabel}
                <InfoPopover content="내 이야기와 관련하여 탐색해볼 수 있는 주제들을 볼 수 있어요." iconColor='white'/>
              </Button>
            </div>

            {inView === false ? (
              <div className="absolute bottom-0 left-0 px-4 mx:px-8 bg-gradient-to-t from-white to-white/0 py-8" style={scrollbarSafeRightStyle}>
                <div className="container">
                  <Button
                    type="primary"
                    className="w-full border-none h-12 mt-4 shadow-lg shadow-teal-900/50 animate-slidein-up"
                    icon={themeButtonIcon}
                    onClick={onThemeSelectionButtonClick}
                  >{themeButtonLabel}<InfoPopover content="내 이야기와 관련하여 탐색해볼 수 있는 주제들을 볼 수 있어요." iconColor='white'/></Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
};
