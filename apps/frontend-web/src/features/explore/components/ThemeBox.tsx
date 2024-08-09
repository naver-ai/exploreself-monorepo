import { useCallback, useEffect, useState } from 'react';
import { Button, Col, ButtonProps, Modal, Form, Input, Divider } from 'antd';
import {
  getNewThemes,
  populateNewThread,
  resetNewThemes,
  setThemeSelectorOpen,
} from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { CloseOutlined } from '@ant-design/icons';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { PlusCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { POPULATE_NEW_THREAD_OPTS } from './common';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormItem } from 'react-hook-form-antd';

const ThemeButton = (props: { theme: string } & ButtonProps) => {
  return <Button
    {...props}
    type="default"
    className={`w-full h-auto flex justify-between text-left pr-2`}
    iconPosition='end'
    icon={<PlusCircleIcon className='w-5 h-5 text-orange-300' />}
  ><span className='whitespace-normal text-left mr-2 flex-1'>{props.theme}</span></Button>
}


const schema = yup.object({
  theme: yup.string().trim().min(1).required(),
})

const ThemeBox = () => {

  const isOpen = useSelector((state) => state.explore.isThemeSelectorOpen);

  const themes = useSelector(state => state.explore.newThemes)
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const isLoadingThemes = useSelector(state => state.explore.isLoadingThemes)
  const isCreatingNewThread = useSelector(state => state.explore.isCreatingNewThread)

  const [currentExpressionIndex, setCurrentExpressionIndex] = useState<number[]>([]);

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
    <Modal
      destroyOnClose
      closable={false}
      footer={null}
      title={<div className='flex items-center justify-between pl-2 pt-1'>
        <span>{t("Theme.Title")}</span>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onCloseThemeSelector}
          disabled={isLoadingThemes}
        />
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
    ><div className={`flex flex-col gap-4 ${themes.length > 0 ? "sm:grid sm:grid-cols-2 md:grid-cols-3" : ""}`}>
        {themes.map(
          (themeItem: { main_theme: string; expressions: string[], quote: string }, index) => (
            <Col key={index} className="bg-slate-100 rounded-lg p-3 gap-y-2 flex flex-col">
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
              <Button
                  className="mt-2 text-gray-500 text-xs"
                  type="text"
                  size="small"
                  onClick={() => handleShowNextExpression(index)}
                  disabled={currentExpressionIndex[index] >= themeItem.expressions.length || isCreatingNewThread || isLoadingThemes}
                  icon={<PlusIcon className='w-4 h-4' />}>
                  {t("Theme.AltExpressions")}
                </Button>
            </Col>
          )
        )}
        {isLoadingThemes ? <LoadingIndicator title={t('Theme.Generating')} /> : 
          <Button onClick={() => fetchThemes(1)} disabled={isCreatingNewThread || isLoadingThemes} 
            className='min-h-16 h-full rounded-md' type="dashed" size="small"><span className='text-sm'>{t("Theme.MoreThemes")}</span></Button>}
      </div>
      {isLoadingThemes == false ? <div className='mt-8'>
        <Divider/>
        <div className='font-semibold text-blue-500 mb-2'>{t("Theme.CustomTitle")}</div>
        <Form disabled={isCreatingNewThread || isLoadingThemes} rootClassName='w-full sm:w-[70%] lg:w-[50%]' clearOnDestroy onFinish={handleSubmit(values => addToThread(values.theme))} className='flex items-center'>
          <FormItem control={control} name="theme" className='m-0 flex-1'>
            <Input
              placeholder={t("Theme.AddMyself")}
            />
          </FormItem>
          <Button disabled={!isValid} htmlType="submit" className='ml-2'>{t("Theme.Add")} </Button>
        </Form>
      </div> : null }
    </Modal>
  );
};

export default ThemeBox;
