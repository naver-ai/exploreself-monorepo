import { useCallback, useEffect, useRef, useState } from 'react';
import { OutlinePanel, PinnedThemesPanel } from '../components/sidebar-views';
import ThemeBox from '../components/ThemeBox';
import { ThreadBox } from '../components/ThreadBox';
import { Card, FloatButton, Drawer, Button } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { Navigate } from 'react-router-dom';
import { UserAvatar } from '../components/UserAvatar';
import { setThemeSelectorOpen } from '../reducer';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { useInView } from 'react-intersection-observer';
import { PartialDarkThemeProvider } from '../../../styles';
import tailwindColors from 'tailwindcss/colors';
import { ShortcutManager } from '../../../services/shortcut';

const SidePanel = () => {
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
      </div>
    </>
  );
};

export const ExplorerPage = () => {
  const initialNarrative = useSelector(
    (state) => state.explore.initial_narrative
  );
  const userName = useSelector((state) => state.explore.name);
  const threadIds = useSelector((state) => state.explore.threads);

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
          <div
            className="overflow-y-scroll h-screen overflow-x-hidden"
            ref={scrollViewRef}
          >
            <ThemeBox />
            <div className="container px-4 md:px-8 py-4 md:py-8 relative">
              <Card ref={narrativeCardRef} title="처음 적었던 고민">
                <span className="text-gray-600 leading-7">
                  {initialNarrative}
                </span>
              </Card>
              {threadIds.map((threadId) => (
                <div key={threadId} className="py-1">
                  <ThreadBox
                    /*TODO theme={workingThread.theme}*/ tid={threadId}
                  />
                </div>
              ))}
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
              <div className="absolute bottom-0 left-0 right-0 px-4 mx:px-8 bg-gradient-to-t from-white to-white/0 py-8">
                <div className="container">
                  <Button
                    type="primary"
                    className="w-full border-none h-12 mt-4 shadow-lg shadow-rose-900/50 animate-slidein"
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
