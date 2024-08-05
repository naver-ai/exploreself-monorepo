import { useCallback, useEffect, useState } from 'react';
import { Button, Row, Space, Col, Drawer, Spin } from 'antd';
import {
  getNewThemes,
  pinTheme,
  resetNewThemes,
  setLoadingThemesFlag,
  setThemeSelectorOpen,
} from '../reducer';
import { MdBookmarkBorder } from 'react-icons/md';
import { useDispatch, useSelector } from '../../../redux/hooks';
import generateThemes from '../../../api_call/generateThemes';
import { CloseOutlined } from '@ant-design/icons';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType, ThemeWithExpressions } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { t } from 'i18next';

const ThemeBox = () => {
  const isOpen = useSelector((state) => state.explore.isThemeSelectorOpen);

  const themes = useSelector(state => state.explore.newThemes)
  const [selected, setSelected] = useState<string>('');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;
  const isLoadingThemes = useSelector(state => state.explore.isLoadingThemes)
  const [currentExpressionIndex, setCurrentExpressionIndex] = useState<number[]>([]);

  const handleShowNextExpression = (index: number) => {
    setCurrentExpressionIndex((prevIndexes) => {
      const newIndexes = [...prevIndexes];
      newIndexes[index] = Math.min(
        newIndexes[index] + 1,
        (themes[index] as {main_theme: string, expressions: string[]}).expressions.length
      );
      return newIndexes;
    });
  };

  useEffect(() => {
    if (themes.length > currentExpressionIndex.length) {
      setCurrentExpressionIndex(prevIndexes => [
        ...prevIndexes,
        ...Array(themes.length - prevIndexes.length).fill(0)
      ]);
    }
  }, [themes]);


  const fetchThemes = useCallback(async () => {
    dispatch(getNewThemes())
  }, []);

  const handleAddPinnedTheme = async (theme: string) => {
    dispatch(pinTheme(theme));
    await postInteractionData(token, InteractionType.UserPinsTheme, {theme: theme}, {})
  };

  const onChangeSelect = (theme: string) => {
    // dispatch(resetPinnedThemes())
    setSelected(theme);
  };

  const onCloseThemeSelector = useCallback(() => {
    dispatch(setThemeSelectorOpen(false));
  }, []);

  useEffect(() => {
    if(isOpen) {
      fetchThemes();
    } else {
      dispatch(resetNewThemes())
    }
  }, [fetchThemes, isOpen]);

  return (
    <Drawer
      placement="left"
      closable={false}
      onClose={onCloseThemeSelector}
      open={isOpen}
      getContainer={false}
      rootStyle={{ position: 'absolute', height: '100vh' }}
    >
      <div>
          <div>
            <div className="w-full flex justify-end">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onCloseThemeSelector}
              />
            </div>
            <Space direction="vertical" className="w-full pt-3">
              {themes.map(
                (themeItem: { main_theme: string; expressions: string[], quote: string }, index) => (
                  <Col className="border-2 border-slate-300 w-full rounded-lg p-3">
                    <Row
                      key={index*10}
                      className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md"
                      onClick={() => onChangeSelect(themeItem.main_theme)}
                      justify="space-between"
                    >
                      <Col className="pl-2">{themeItem.main_theme}</Col>
                      <Col>
                        <Button
                          icon={<MdBookmarkBorder />}
                          onClick={() => handleAddPinnedTheme(themeItem.main_theme)}
                          size="small"
                          type="text"
                          className="text-[10px]"
                        >
                          {' '}
                          담아두기
                        </Button>
                      </Col>
                    </Row>
                    {themeItem.expressions.slice(0, currentExpressionIndex[index]).map((exp, i) => {
                      return (
                        <Row
                          key={index*10 + i}
                          className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md my-1"
                          onClick={() => onChangeSelect(exp)}
                          justify="space-between"
                        >
                          <Col className="pl-2">{exp}</Col>
                          <Col>
                            <Button
                              icon={<MdBookmarkBorder />}
                              onClick={() => handleAddPinnedTheme(exp)}
                              size="small"
                              type="text"
                              className="text-[10px]"
                            >
                              {' '}
                              담아두기
                            </Button>
                          </Col>
                        </Row>
                      )
                    })}
                    <Row className="w-full">
                      <Button
                        className="w-full mt-2 text-gray-500 text-xs"
                        type="text"
                        size="small"
                        onClick={() => handleShowNextExpression(index)}
                        disabled={currentExpressionIndex[index] >= themeItem.expressions.length}
                      >
                        + 다른 표현 보기
                      </Button>
                    </Row>
                  </Col>
                )
              )}
              {isLoadingThemes? <LoadingIndicator title='탐색해볼 주제 생성 중'/>: <Button onClick={fetchThemes}>{t("ThemeSelection.MoreThemes")}</Button>}
            </Space>
          </div>
        
      </div>
    </Drawer>
  );
};

export default ThemeBox;
