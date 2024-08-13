import { useCallback, useEffect, useState, useRef} from 'react';
import React from 'react';
import { Button, Col, ButtonProps, Modal, Form, Input, Divider, Tour, TourProps, Typography } from 'antd';
import {
  getNewThemes,
  pinTheme,
  populateNewThread,
  resetNewThemes,
  setThemeSelectorOpen,
  updateDidTutorial,
} from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { CloseOutlined } from '@ant-design/icons';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { BookmarkIcon, PlusCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { POPULATE_NEW_THREAD_OPTS } from './common';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormItem } from 'react-hook-form-antd';
import { InfoPopover } from '../../../components/InfoPopover';
import { init } from 'i18next';
import { PinnedThemesPanel } from './pinned-themes';
const { Text } = Typography;


interface ThemeButtonProps extends ButtonProps {
  theme: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

const ThemeButton = React.forwardRef<HTMLButtonElement, ThemeButtonProps>((props, ref?) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const { buttonRef, theme, ...rest } = props;

  const handleAddPinnedTheme = async (theme: string) => {
    dispatch(pinTheme(theme));
    await postInteractionData(token, InteractionType.UserPinsTheme, {theme: theme}, {})
  };

  return (
    <div className='flex'>
    <Button
      {...rest}
      ref={ref ? ref : null}
      type="default"
      className="w-full h-auto flex justify-between text-left pr-2"
      iconPosition="end"
    >
      <span className="whitespace-normal text-left mr-2 flex-1">{theme}</span>
    </Button>
    <Button ref={buttonRef ? buttonRef : null} icon={<BookmarkIcon className="w-5 h-5" style={{ color: '#CCCCCC' }}/>} type="text" onClick={() => handleAddPinnedTheme(theme)}/>
    </div>
  );
});


const schema = yup.object({
  theme: yup.string().trim().min(1).required(),
})

const ThemeBox = () => {

  const isOpen = useSelector((state) => state.explore.isThemeSelectorOpen);
  const didTutorial = useSelector((state) => state.explore.didTutorial)

  const themes = useSelector(state => state.explore.newThemes)
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const isLoadingThemes = useSelector(state => state.explore.isLoadingThemes)
  const isCreatingNewThread = useSelector(state => state.explore.isCreatingNewThread)
  const [isTourClosing, setIsTourClosing] = useState(false);

  const [currentExpressionIndex, setCurrentExpressionIndex] = useState<number[]>([]);

  const refNewThemes = useRef(null);
  const refOneTheme = useRef(null);
  const refAltExp = useRef(null);
  const refMoreThemes = useRef(null);
  const refCreateTheme = useRef(null);
  const refBookmark = useRef(null);
  const refPinnedThemes = useRef(null);

  const steps: TourProps['steps'] = [
    {
      title: "주제 탐색하기 창 활용 안내",
      description: (
        <Text style={{color: '#555'}}>
          <span className='font-semibold'>[주제 탐색하기] </span>창에 들어오셨군요!👍 <br/> <span className='font-semibold'>[다음]</span> 버튼을 눌러 안내를 확인해주세요.
        </Text>
      ),
      target: null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    },
    {
      title: "AI 생성 주제들",
      description: (
        <Text style={{color: '#555'}}>
          AI가 나의 이야기로부터 생성한 주제들
        </Text>
      ),
      target: () => refNewThemes.current || null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    },
    {
      title: "",
      description: "비슷한 주제의 다양한 표현을 살펴볼 수 있어요.",
      target: () => refAltExp.current || null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    }, 
    {
      title: "",
      description: (
        <Text style={{color: '#555'}}>
          주제를 누르게 되면, 바로 주제에 대한 타래가 생성되어요.
        </Text>
      ),
      target: () => refOneTheme.current || null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    },
    {
      title: "주제 더 보기",
      description: (
        <Text style={{color: '#555'}}>
          더 많은 주제를 보고 싶으면 AI가 생성해주어요. AI가 주제를 더 만들 수 없을 경우도 있어요.
        </Text>
      ),
      target: () => refMoreThemes.current || null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    },
    {
      title: "주제 담아두기",
      description: (
        <Text style={{color: '#555'}}>
          이따 탐색해보고 싶은 주제를 없어지지 않게 보관해두고 싶나요? <br/>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}><BookmarkIcon className="w-5 h-5" style={{ color: '#CCCCCC' }}/></span> 버튼을 누르면 아래의 <span>주제 바구니</span>에 주제를 담아둘 수 있어요. 
        </Text>
      ),
      target: () => refBookmark.current || null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    },
    {
      title: "주제 바구니",
      description: (
        <Text style={{color: '#555'}}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}><BookmarkIcon className="w-5 h-5" style={{ color: '#CCCCCC' }}/></span> 버튼을 누르면, 이곳의 <span className='font-semibold'>주제 바구니</span>에 주제를 담아둘 수 있어요. 
        </Text>
      ),
      target: () => refPinnedThemes.current || null,
      nextButtonProps: {
        children: '다음'
      },
      prevButtonProps: {
        children: '이전'
      },
    },
    {
      title: "주제 직접 작성하기",
      description: (
        <Text style={{color: '#555'}}>
          내가 직접 추가하고 싶은 주제가 있다면, 직접 작성해보아요.
        </Text>
      ),
      target: () => refCreateTheme.current || null,
      nextButtonProps: {
        children: '완료'
      },
      prevButtonProps: {
        children: '이전'
      },
    }
  ];


  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
  });

  const [t] = useTranslation()

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
          <div onClick={handleTourOpen} className='cursor-pointer hover:text-blue-500 text-sm font-thin pr-3'>사용 안내 다시보기</div>
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
                  <InfoPopover content='비슷한 주제의 다양한 표현들을 살펴볼 수 있어요.'/>
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
          <div className='ml-1 font-semibold text-blue-500 mb-2'> 주제 바구니</div>
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
