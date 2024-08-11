import { MouseEventHandler, useCallback, useMemo, useState} from 'react';
import { Tooltip, ConfigProvider, Input, Space, Timeline, Button, Form } from 'antd';
import { pinTheme, populateNewThread, setHoveringOutlineThreadId, setThemeSelectorOpen, threadSelectors, unpinTheme } from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { ListBulletIcon, ArchiveBoxIcon, ArrowTurnUpLeftIcon, MinusCircleIcon } from '@heroicons/react/20/solid';
import { PanelGroup } from '../../../components/PanelGroup';
import { ShortcutManager } from '../../../services/shortcut';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { useTranslation } from 'react-i18next';
import { useHover } from '@uidotdev/usehooks';
import colors from 'tailwindcss/colors';
import { POPULATE_NEW_THREAD_OPTS } from './common';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormItem } from 'react-hook-form-antd';


const OUTLINE_PANEL_CLASS =
  'select-none hover:bg-slate-100 hover:outline outline-slate-100 hover:outline-4 rounded-sm cursor-pointer';

export const OutlinePanel = () => {
  const threads = useSelector(threadSelectors.selectAll);

  const dispatch = useDispatch()

  const [t] = useTranslation()

  const themeListTimelineItems = useMemo(() => {
    const timelineItems = threads?.map((thread) => {
      return {
        children: (
          <div
            className={OUTLINE_PANEL_CLASS}
            onMouseEnter={()=>{dispatch(setHoveringOutlineThreadId(thread._id))}}
            onMouseLeave={()=>{dispatch(setHoveringOutlineThreadId(undefined))}}
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
      info={t("Info.Outline")}
    >
      <Timeline className="px-1" items={themeListTimelineItems} />
    </PanelGroup>
  );
};



const ThemeElement = (props: { theme: string }) => {

  const [t] = useTranslation()

  const token = useSelector((state) => state.auth.token) as string;

  const [ref, hoveringRemoveButton] = useHover();

  const dispatch = useDispatch();

  const handleRemovePinnedTheme = useCallback<MouseEventHandler<HTMLElement>>(async (ev) => {
    ev.stopPropagation()
    dispatch(unpinTheme(props.theme, true));
    await postInteractionData(token, InteractionType.UserUnpinsTheme, { theme: props.theme }, {})

  }, [token, props.theme])

  const addToThread = useCallback(
    async () => {
        dispatch(unpinTheme(props.theme, false))
        dispatch(setThemeSelectorOpen(false))
        dispatch(populateNewThread(props.theme, POPULATE_NEW_THREAD_OPTS))
        await postInteractionData(token, InteractionType.UserSelectsTheme, {theme: props.theme}, {})
    },
    [token, props.theme]
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

  const schema = yup.object({
    theme: yup.string().trim().min(1).required(),
  })

  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
  });

  const onUndoClick = useCallback(()=>{
    if(recentRemovedTheme){
      dispatch(pinTheme(recentRemovedTheme))
    }
  }, [recentRemovedTheme])


  const handleAddTheme = useCallback(async(values: {theme: string}) => {
    dispatch(pinTheme(values.theme))
    reset();
    await postInteractionData(token, InteractionType.UserAddsTheme, {theme: values.theme}, {})
  },[token])

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
      <Space direction="horizontal" className='flex mt-2 border-t-[1px] pt-2'>
        <Form onFinish={handleSubmit(handleAddTheme)} className='flex items-center'>
          <FormItem control={control} name="theme">
            <Input
            placeholder={t("Theme.AddMyself")}
            />
          </FormItem>
          <Button disabled={!isValid} htmlType="submit" className='ml-2'>{t("Theme.Add")} </Button>
        </Form>
        
        
      </Space>
    </PanelGroup>
  );
};
