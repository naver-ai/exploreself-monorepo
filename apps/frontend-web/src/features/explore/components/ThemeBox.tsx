import { useCallback, useEffect, useState } from 'react';
import { Button, Row, Space, Col, Drawer, ButtonProps } from 'antd';
import {
  getNewThemes,
  pinTheme,
  populateNewThread,
  resetNewThemes,
  setThemeSelectorOpen,
} from '../reducer';
import { MdBookmarkBorder } from 'react-icons/md';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { CloseOutlined } from '@ant-design/icons';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import { ShortcutManager } from '../../../services/shortcut';
import { useTranslation } from 'react-i18next';
import { POPULATE_NEW_THREAD_OPTS } from './common';


const ThemeButton = (props: {theme: string} & ButtonProps) => {
  return <Button
  {...props}
  type="default"
  className={`w-full h-auto flex justify-between text-left`}
  iconPosition='end'
  icon={<ArrowRightIcon className='w-5 h-5'/>}
><span className='whitespace-normal text-left mr-2 flex-1'>{props.theme}</span></Button>
} 

const ThemeBox = () => {

  const isOpen = useSelector((state) => state.explore.isThemeSelectorOpen);

  const themes = useSelector(state => state.explore.newThemes)
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const isLoadingThemes = useSelector(state => state.explore.isLoadingThemes)
  const isCreatingNewThread = useSelector(state => state.explore.isCreatingNewThread)

  const [currentExpressionIndex, setCurrentExpressionIndex] = useState<number[]>([]);

  const [t] = useTranslation()

  const handleShowNextExpression = async (index: number) => {
    const newIndexes = [...currentExpressionIndex];
    newIndexes[index] = Math.min(
      newIndexes[index] + 1,
      (themes[index] as { main_theme: string, expressions: string[] }).expressions.length
    );
    setCurrentExpressionIndex(newIndexes);
    await postInteractionData(token, InteractionType.UserRequestExpression, { main_theme: themes[index].main_theme, expression: themes[index].expressions[newIndexes[index]] }, {})
  };

  useEffect(() => {
    if (themes.length > currentExpressionIndex.length) {
      setCurrentExpressionIndex(prevIndexes => [
        ...prevIndexes,
        ...Array(themes.length - prevIndexes.length).fill(0)
      ]);
    }
  }, [themes]);

  const addToThread = useCallback(
    async (selected: string) => {
      dispatch(setThemeSelectorOpen(false))
      dispatch(populateNewThread(selected, POPULATE_NEW_THREAD_OPTS))
      await postInteractionData(token, InteractionType.UserSelectsTheme, { theme: selected }, {})
    },
    [token]);

  const fetchThemes = useCallback(async (opt: number) => {
    dispatch(getNewThemes(opt))
  }, []);

  const onCloseThemeSelector = useCallback(() => {
    dispatch(setThemeSelectorOpen(false));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentExpressionIndex([])
      dispatch(resetNewThemes())
      fetchThemes(3);
    } else {
      setCurrentExpressionIndex([])
      dispatch(resetNewThemes())
    }
  }, [fetchThemes, isOpen]);

  return (
    <Drawer
      placement="left"
      closable={false}
      maskClosable={false}
      onClose={onCloseThemeSelector}
      open={isOpen}
      getContainer={false}
      rootClassName='absolute h-[100vh] w-full'
      classNames={{ body: "!p-2" }}
    >
        <div className="flex justify-end">
          <Button
            type="text"
            icon={<CloseOutlined/>}
            onClick={onCloseThemeSelector}
            disabled={isLoadingThemes}
          />
        </div>
        <Space direction="vertical" className="w-full p-3">
          {themes.map(
            (themeItem: { main_theme: string; expressions: string[], quote: string }, index) => (
              <Col key={index} className="bg-slate-100 w-full rounded-lg p-3 gap-y-2 flex flex-col">
                <ThemeButton
                  key={index * 10}
                  disabled={isCreatingNewThread || isLoadingThemes}
                  onClick={() => addToThread(themeItem.main_theme)}
                  theme={themeItem.main_theme}
                  />
                {themeItem.expressions.slice(0, currentExpressionIndex[index]).map((exp, i) => {
                  return (
                    <ThemeButton
                      key={index * 10 + i}
                      disabled={isCreatingNewThread || isLoadingThemes}
                      onClick={() => addToThread(exp)}
                      theme={exp}
                      />
                  )
                })}
                <Row className="w-full">
                  <Button
                    className="w-full mt-2 text-gray-500 text-xs"
                    type="text"
                    size="small"
                    onClick={() => handleShowNextExpression(index)}
                    disabled={currentExpressionIndex[index] >= themeItem.expressions.length || isCreatingNewThread || isLoadingThemes}
                    icon={<PlusIcon className='w-4 h-4' />}>
                    {t("Theme.AltExpressions")}
                  </Button>
                </Row>
              </Col>
            )
          )}
          {isLoadingThemes ? <LoadingIndicator title={t('Theme.Generating')} /> : <Button onClick={() => fetchThemes(1)} disabled={isCreatingNewThread || isLoadingThemes} type="dashed" size="small"><span className='text-sm'>{t("Theme.MoreThemes")}</span></Button>}
        </Space>
    </Drawer>
  );
};

export default ThemeBox;
