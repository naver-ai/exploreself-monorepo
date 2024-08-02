import { useCallback, useEffect, useMemo, useState } from 'react';
import { Timeline } from 'antd';
import { populateNewThread, setThemeSelectorOpen, threadSelectors, unpinTheme } from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { IThreadWithQuestionIds } from '@core';
import { ListBulletIcon, ArchiveBoxIcon } from '@heroicons/react/20/solid';
import { PanelGroup } from '../../../components/PanelGroup';
import { ShortcutManager } from '../../../services/shortcut';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';

const OUTLINE_PANEL_CLASS =
  'select-none hover:bg-slate-100 hover:outline outline-slate-100 hover:outline-4 rounded-sm cursor-pointer';

export const OutlinePanel = () => {
  const threads = useSelector(threadSelectors.selectAll);

  const token = useSelector((state) => state.auth.token) as string;

  const themeListTimelineItems = useMemo(() => {
    const timelineItems = threads?.map((thread) => {
        return {
          children: (
            <div
              className={OUTLINE_PANEL_CLASS}
              onClick={() => {
                ShortcutManager.instance.requestFocus({
                  id: thread._id,
                  type: 'thread',
                });
              }}
            >
              {thread.theme}
            </div>
          ),
        };
      }) || [];
    return [
      {
        children: (
          <div
            className={OUTLINE_PANEL_CLASS}
            onClick={() => {
              ShortcutManager.instance.requestFocus({ type: 'narrative' });
            }}
          >
            {'처음 적었던 고민'}
          </div>
        ),
      },
    ].concat(timelineItems as any);
  }, [threads]);

  return (
    <PanelGroup
      iconComponent={ListBulletIcon}
      title={'개요'}
      titleContainerClassName="!mb-5"
    >
      <Timeline className="px-1" items={themeListTimelineItems} />
    </PanelGroup>
  );
};

export const PinnedThemesPanel = () => {
  const token = useSelector((state) => state.auth.token) as string;

  const dispatch = useDispatch();

  const uid = useSelector((state) => state.explore.userId);
  const pinnedThemes = useSelector((state) => state.explore.pinnedThemes);

  const addToThread = useCallback(
    async (selected: string) => {
      if (uid != null) {
        dispatch(unpinTheme(selected, false))
        dispatch(populateNewThread(selected))
        dispatch(setThemeSelectorOpen(false))
        await postInteractionData(token, InteractionType.UserSelectsTheme, {theme: selected}, {})
      }
    },
    [uid]
  );

  return (
    <PanelGroup
      iconComponent={ArchiveBoxIcon}
      title={'주제 바구니'}
      titleContainerClassName="!mb-3"
    >
      {pinnedThemes.length == 0 ? (
        <div className="bg-slate-100 rounded-lg p-2 py-1 text-sm text-gray-400">
          아직 담은 주제가 없습니다.
        </div>
      ) : (
        <div>
          {pinnedThemes.map((theme, i) => (
            <div key={i} onClick={() => addToThread(theme)}>
              {theme}
            </div>
          ))}
        </div>
      )}
    </PanelGroup>
  );
};
