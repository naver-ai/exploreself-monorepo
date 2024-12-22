import { useCallback, useEffect, useState, useRef, useMemo} from 'react';
import React from 'react';
import { Button, Col, ButtonProps, Modal, Form, Input, Divider, Tour, TourProps, Typography, Tooltip } from 'antd';
import {
  getNewThemes,
  pinTheme,
  populateNewThread,
  setThemeSelectorOpen,
  unpinTheme
} from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { CloseOutlined } from '@ant-design/icons';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { BookmarkIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { POPULATE_NEW_THREAD_OPTS } from './common';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormItem } from 'react-hook-form-antd';
import { InfoPopover } from '../../../components/InfoPopover';
import { PinnedThemesPanel } from './pinned-themes';
import { updateDidTutorial } from '../../user/reducer';
import reactStringReplace from 'react-string-replace';
const { Text } = Typography;


const VARIABLE_REGEX = /({{[a-zA-Z]+}})/g

interface ThemeButtonProps extends ButtonProps {
  theme: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

const ThemeButton = React.forwardRef<HTMLButtonElement, ThemeButtonProps>((props, ref?) => {

  const [t] = useTranslation()

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const { buttonRef, theme, ...rest } = props;
  const isPinned = useSelector(state => state.agenda.pinnedThemes.includes(theme))

  const onPinButtonClick = async () => {
    if(isPinned){
      dispatch(unpinTheme(theme, false))
      await postInteractionData(token, InteractionType.UserUnpinsTheme, { theme }, {})
    }else{
      dispatch(pinTheme(theme));
      await postInteractionData(token, InteractionType.UserPinsTheme, { theme }, {})
    }
  };

  return (
    <div className='flex'>

    <Tooltip mouseEnterDelay={0.2} mouseLeaveDelay={0} title={t("Theme.Tooltip.NewThread")}>
      <Button
        {...rest}
        ref={ref ? ref : null}
        type="default"
        className="w-full h-auto flex justify-between text-left pr-2"
        iconPosition="end"
      >
        <span className="whitespace-normal text-left mr-2 flex-1">{theme}</span>
      </Button>
    </Tooltip>
    <Tooltip mouseEnterDelay={0.5} mouseLeaveDelay={0} title={isPinned === true ? t("Theme.Tooltip.UnpinTheme") : t("Theme.Tooltip.PinTheme")}>
      <Button ref={buttonRef ? buttonRef : null} icon={<BookmarkIcon className={`w-5 h-5 ${isPinned ? 'text-orange-300' : 'text-[#CCCCCC]'}`}/>} type="text" onClick={onPinButtonClick}/>
    </Tooltip>
    </div>
  );
});


const schema = yup.object({
  theme: yup.string().trim().min(1).required(),
})

const ThemeBox = () => {

  const isOpen = useSelector((state) => state.agenda.isThemeSelectorOpen);
  const didTutorial = useSelector((state) => state.user.didTutorial)

  const themes = useSelector(state => state.agenda.newThemes)
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const isLoadingThemes = useSelector(state => state.agenda.isLoadingThemes)
  const isCreatingNewThread = useSelector(state => state.agenda.isCreatingNewThread)
  const [isTourClosing, setIsTourClosing] = useState(false);

  const [currentExpressionIndex, setCurrentExpressionIndex] = useState<number[]>([]);

  const refNewThemes = useRef(null);
  const refOneTheme = useRef(null);
  const refAltExp = useRef(null);
  const refMoreThemes = useRef(null);
  const refCreateTheme = useRef(null);
  const refBookmark = useRef(null);
  const refPinnedThemes = useRef(null);

  const [t] = useTranslation()
 
  const steps: TourProps['steps'] = useMemo(()=>[
    {
      title: t("Theme.Tour.Intro.Title"),
      description: <span className='text-[#555]'>{reactStringReplace(t("Theme.Tour.Intro.Description"), VARIABLE_REGEX, (match, i) => {
        switch(match){
          case "{{newline}}": return <br key={match+i}/>
          case "{{title}}":
            return <span key={match+i} className='font-semibold'>[{t("Theme.Title")}]</span>
          case "{{next}}":
            return <span key={match+i} className='font-semibold'>[{t("Theme.Tour.Next")}]</span>
        }
      })}</span>,
      target: null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    },
    {
      title: t("Theme.Tour.Themes.Title"),
      description: (<span className='text-[#555]'>{t("Theme.Tour.Themes.Description")}</span>),
      target: () => refNewThemes.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    },
    {
      title: "",
      description: t("Theme.Tour.Variants.Description"),
      target: () => refAltExp.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    }, 
    {
      title: "",
      description: (<span className='text-[#555]'>{t("Theme.Tour.OneTheme.Description")}</span>),
      target: () => refOneTheme.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    },
    {
      title: t("Theme.Tour.MoreThemes.Title"),
      description: (<span className='text-[#555]'>{t("Theme.Tour.MoreThemes.Description")}</span>),
      target: () => refMoreThemes.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    },
    {
      title: t("Theme.Tour.PinThemes.Title"),
      description: (<span className='text-[#555]'>{reactStringReplace(t("Theme.Tour.PinThemes.Description"), VARIABLE_REGEX, (match, i) => {
        switch(match){
          case "{{newline}}": return <br key={match+i}/>
          case "{{bookmark}}":
            return <span key={match+i} style={{ display: 'inline-flex', alignItems: 'center' }}><BookmarkIcon className="w-5 h-5 text-[#CCC]"/></span>
        }
      })}</span>
      ),
      target: () => refBookmark.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    },
    {
      title: t("Theme.Tour.PinnedThemes.Title"),
      description: (<span className="text-[#555]">{reactStringReplace(t("Theme.Tour.PinnedThemes.Description"), VARIABLE_REGEX, (match, i) => {
        switch(match){
          case "{{bookmark}}":
            return <span key={match+i} style={{ display: 'inline-flex', alignItems: 'center' }}><BookmarkIcon className="w-5 h-5 text-[#CCC]"/></span>
        }
      })}</span>
      ),
      target: () => refPinnedThemes.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Next")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    },
    {
      title: t("Theme.Tour.CreateTheme.Title"),
      description: (<span className="text-[#555]">{t("Theme.Tour.CreateTheme.Description")}</span>),
      target: () => refCreateTheme.current || null,
      nextButtonProps: {
        children: t("Theme.Tour.Complete")
      },
      prevButtonProps: {
        children: t("Theme.Tour.Previous")
      },
    }
  ], [t])


  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
  });

  const handleShowNextExpression = async (index: number) => {
    if (isTourClosing) return;
    const newIndexes = [...currentExpressionIndex];
    newIndexes[index] = Math.min(
      newIndexes[index] + 1,
      (themes[index] as { main_theme: string, expressions: string[] }).expressions.length
    );
    setCurrentExpressionIndex(newIndexes);
    await postInteractionData(token, InteractionType.UserRequestExpression, { main_theme: themes[index].main_theme, expression: themes[index].expressions[newIndexes[index]] }, {})
  };

  useEffect(() => {
    if (isTourClosing) return;
    if (themes.length > currentExpressionIndex.length) {
      setCurrentExpressionIndex(prevIndexes => [
        ...prevIndexes,
        ...Array(themes.length - prevIndexes.length).fill(0)
      ]);
    }
  }, [themes]);

  const addToThread = useCallback(
    async (selected: string) => {
      if (isTourClosing) return;
      dispatch(setThemeSelectorOpen(false))
      dispatch(populateNewThread(selected, POPULATE_NEW_THREAD_OPTS))
      await postInteractionData(token, InteractionType.UserSelectsTheme, { theme: selected }, {})
    },
    [token, dispatch, isTourClosing]);

  const fetchThemes = useCallback(async (opt: number) => {
    if (isTourClosing) return;
    dispatch(getNewThemes(opt))
  }, [dispatch, isTourClosing]);

  const onCloseThemeSelector = useCallback(() => {
    dispatch(setThemeSelectorOpen(false));
  }, []);

  const handleTourClose = () => {
    setIsTourClosing(true);
    setTimeout(() => {
      dispatch(updateDidTutorial('themeBox', true));
      setIsTourClosing(false); 
    }, 300);
  };
  const handleTourOpen = () => {
    dispatch(updateDidTutorial('themeBox', false))
  }

  useEffect(() => {
    setCurrentExpressionIndex([])
  }, [isOpen]);

  return (
    <Modal
      destroyOnClose
      closable={false}
      footer={null}
      title={<div className='flex items-center justify-between pl-2 pt-1'>
        <span>{t("Theme.Title")}</span>
        <div className='flex items-center'>
          {
            isLoadingThemes == false && didTutorial.themeBox == true ? <div onClick={handleTourOpen} className='cursor-pointer hover:text-blue-500 text-sm font-thin pr-3'>{t("Labels.ShowHelp")}</div> : null
          }
          
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onCloseThemeSelector}
            disabled={isLoadingThemes || isTourClosing}
          />
        </div>
        
      </div>}
      maskClosable={false}
      onClose={onCloseThemeSelector}
      open={isOpen}
      getContainer={false}
      rootClassName='w-full'
      className='w-full'
      width={"100%"}
      wrapClassName='container'
      classNames={{ content: "!p-3", body: "!p-2" }}
    ><div className={`flex flex-col gap-4 ${themes.length > 0 ? "sm:grid sm:grid-cols-2 md:grid-cols-3" : ""}`} ref={refNewThemes}>
        {themes.map(
          (themeItem: { main_theme: string; expressions: string[], quote: string }, index) => (
            <Col key={index} className="bg-slate-100 rounded-lg p-3 gap-y-2 flex flex-col">
              <ThemeButton
                key={index * 10}
                disabled={isCreatingNewThread || isLoadingThemes || isTourClosing}
                onClick={() => addToThread(themeItem.main_theme)}
                theme={themeItem.main_theme}
                ref={index == 0? refOneTheme: null}
                buttonRef={index == 0? refBookmark: null}
              />
              {themeItem.expressions.slice(0, currentExpressionIndex[index]).map((exp, i) => {
                return (
                  <ThemeButton
                    key={index * 10 + i}
                    disabled={isCreatingNewThread || isLoadingThemes || isTourClosing}
                    onClick={() => addToThread(exp)}
                    theme={exp}
                  />
                )
              })}
              <Button
                  className="mt-2 text-gray-500 text-xs"
                  type="text"
                  size="small"
                  onClick={() => handleShowNextExpression(index)}
                  disabled={currentExpressionIndex[index] >= themeItem.expressions.length || isCreatingNewThread || isLoadingThemes || isTourClosing}
                  icon={<PlusIcon className='w-4 h-4' />} ref={ index == 0? refAltExp: null}>
                  {t("Theme.AltExpressions")}
                  <InfoPopover content={t("Theme.Tooltip.ThemeVariation")}/>
                </Button>
            </Col>
          )
        )}
        {isLoadingThemes ? <LoadingIndicator title={t('Theme.Generating')} /> : 
          <Button onClick={() => fetchThemes(1)} disabled={isCreatingNewThread || isLoadingThemes || isTourClosing} 
            className='min-h-16 h-full rounded-md' type="dashed" size="small" ref={refMoreThemes}><span className='text-sm'>{t("Theme.MoreThemes")}</span></Button>}
      </div>
      {!isLoadingThemes && (
        <div className='mt-8' ref={refPinnedThemes}>
          <div className='flex'>
          <BookmarkIcon className="w-5 h-5 text-orange-300"/>
          <div className='ml-1 font-semibold text-blue-500 mb-2'>{t("Theme.PinTitle")}</div>
          </div>
          
          <PinnedThemesPanel/>
        </div>
      )}
      {isLoadingThemes == false ? <div className='mt-8' ref={refCreateTheme}>
        <Divider/>
        <div className='font-semibold text-blue-500 mb-2'>{t("Theme.CustomTitle")}</div>
        <Form disabled={isCreatingNewThread || isLoadingThemes || isTourClosing} rootClassName='w-full sm:w-[70%] lg:w-[50%]' clearOnDestroy onFinish={handleSubmit(values => addToThread(values.theme))} className='flex items-center'>
          <FormItem control={control} name="theme" className='m-0 flex-1'>
            <Input
              placeholder={t("Theme.AddMyself")}
            />
          </FormItem>
          <Button disabled={!isValid || isTourClosing} htmlType="submit" className='ml-2'>{t("Theme.Add")} </Button>
        </Form>
      </div> : null }
      {!isLoadingThemes && (
        <Tour 
          open={!(didTutorial.themeBox)} 
          steps={steps} 
          onFinish={handleTourClose}
          onClose={handleTourClose}
        />
      )}
    </Modal>
  );
};

export default ThemeBox;
