import { MouseEventHandler, useCallback, useMemo, useState} from 'react';
import { Tooltip, ConfigProvider, Input, Space, Timeline, Button } from 'antd';
import { pinTheme, populateNewThread, setThemeSelectorOpen, threadSelectors, unpinTheme } from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { ListBulletIcon, ArchiveBoxIcon, ArrowTurnUpLeftIcon, MinusCircleIcon } from '@heroicons/react/20/solid';
import { PanelGroup } from '../../../components/PanelGroup';
import { ShortcutManager } from '../../../services/shortcut';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { CloseOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next';
import { useHover } from '@uidotdev/usehooks';
import colors from 'tailwindcss/colors';

const OUTLINE_PANEL_CLASS =
  'select-none hover:bg-slate-100 hover:outline outline-slate-100 hover:outline-4 rounded-sm cursor-pointer';

export const OutlinePanel = () => {
  const threads = useSelector(threadSelectors.selectAll);

  const [t] = useTranslation()

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
            {t("Narrative.InitialNarrative")}
          </div>
        ),
      },
    ].concat(timelineItems as any);
  }, [threads]);

  return (
    <PanelGroup
      iconComponent={ListBulletIcon}
      title={t("Outline.Title")}
      titleContainerClassName="!mb-5"
    >
      <Timeline className="px-1" items={themeListTimelineItems} />
    </PanelGroup>
  );
};

const ThemeElement = (props: { theme: string }) => {

  const [t] = useTranslation()

  const token = useSelector((state) => state.auth.token) as string;

  const uid = useSelector((state) => state.explore.userId);

  const [ref, hoveringRemoveButton] = useHover();

  const dispatch = useDispatch();

  const handleRemovePinnedTheme = useCallback<MouseEventHandler<HTMLElement>>(async (ev) => {
    ev.stopPropagation()
    dispatch(unpinTheme(props.theme, true));
    await postInteractionData(token, InteractionType.UserUnpinsTheme, { theme: props.theme }, {})

  }, [token, props.theme])

  const addToThread = useCallback(
    async () => {
      if (uid != null) {
        dispatch(unpinTheme(props.theme, false))
        const tid = await dispatch(populateNewThread(props.theme))
        dispatch(setThemeSelectorOpen(false))
        if(tid) {
          ShortcutManager.instance.requestFocus({
            id: tid as string,
            type: 'thread',
          })
        }
        await postInteractionData(token, InteractionType.UserSelectsTheme, {theme: props.theme}, {})
      }
    },
    [uid, props.theme]
  );

  return <Tooltip title={hoveringRemoveButton ? '' : t("Theme.Tooltip.NewThread")} mouseLeaveDelay={0}>
    <div onClick={addToThread} className='group flex items-center rounded-lg p-2 pl-3 cursor-pointer transition-colors justify-between bg-slate-200/50 [&:hover:not(:has(*:hover))]:bg-slate-200 [&:has(*:hover)]:!bg-slate-50'>
      <span className='flex-1 mr-2 pointer-events-none select-none leading-7'>{props.theme}</span>
      <Button ref={ref} type="text" className='invisible group-hover:visible p-0' shape="circle" size="small" icon={<MinusCircleIcon className='w-5 h-5 text-rose-400'/>} onClick={handleRemovePinnedTheme} />
    </div>
  </Tooltip>
}

const UndoButtonTheme = {token: {colorPrimary: colors.rose["400"]}}

export const PinnedThemesPanel = () => {

  const [t] = useTranslation()

  const dispatch = useDispatch()

  const pinnedThemes = useSelector((state) => state.explore.pinnedThemes);
  const recentRemovedTheme = useSelector(state => state.explore.recentRemovedTheme)
  const token = useSelector((state) => state.auth.token) as string;

  const onUndoClick = useCallback(()=>{
    if(recentRemovedTheme){
      dispatch(pinTheme(recentRemovedTheme))
    }
  }, [recentRemovedTheme])

  const [userTheme, setUserTheme] = useState<string>('')

  const handleAddTheme = useCallback(() => {
    async () => {
      dispatch(pinTheme(userTheme))
      setUserTheme('')
      await postInteractionData(token, InteractionType.UserAddsTheme, {theme: userTheme}, {})
    }
  },[userTheme, token, setUserTheme])

  return (
    <PanelGroup
      iconComponent={ArchiveBoxIcon}
      title={t("Theme.Title")}
      titleContainerClassName="!mb-3"
    >
      {pinnedThemes.length == 0 ? (
        <div className="select-none bg-slate-100 rounded-lg p-2 py-1 text-sm text-gray-400">
          {t("Theme.NoTheme")}
        </div>
      ) : (
        <div className='grid col-1 gap-y-2'>
          {pinnedThemes.map((theme, i) => <ThemeElement key={i} theme={theme} />)}
        </div>
        
      )}
      {
        recentRemovedTheme != null ? <div className="text-right"><ConfigProvider theme={UndoButtonTheme}>
          <Tooltip title={`"${recentRemovedTheme}"`}>
            <Button type="primary" size="small" className='animate-zoom-in mt-3 text-sm' onClick={onUndoClick} icon={<ArrowTurnUpLeftIcon className='w-4 h-4'/>}>{t("Theme.UndoDelete")}</Button>
            </Tooltip>
          </ConfigProvider></div> : null
      }
      <Space direction="horizontal" className='mt-2 border-t-[1px] pt-2'>
        <Input
          placeholder={t("Theme.AddMyself")}
          value={userTheme}
          onChange={(e) => setUserTheme(e.target.value)}
        />
        <Button 
          style={{ width: 80 }}
          onClick={handleAddTheme}
        >
          {t("Theme.Add")}
        </Button>
      </Space>
    </PanelGroup>
  );
};
