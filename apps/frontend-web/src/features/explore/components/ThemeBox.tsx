import { useCallback, useEffect, useState } from 'react';
import { Button, Row, Space, Col, Drawer } from 'antd';
import {
  addPinnedTheme,
  setThemeSelectorOpen,
} from '../reducer';
import { MdBookmarkBorder } from 'react-icons/md';
import { useDispatch, useSelector } from '../../../redux/hooks';
import generateThemes from '../../../api_call/generateThemes';
import { CloseOutlined } from '@ant-design/icons';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';

const ThemeBox = () => {
  const isOpen = useSelector((state) => state.explore.isThemeSelectorOpen);

  const [themes, setThemes] = useState([]);
  const [respThemes, setRespThemes] = useState([]);
  const [selected, setSelected] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string;

  const fetchInitThemes = useCallback(async () => {
    const data = await generateThemes(token);
    setThemes(data);
  }, [token]);

  const handleAddPinnedTheme = async (theme: string) => {
    dispatch(addPinnedTheme(theme));
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
    fetchInitThemes();
  }, [fetchInitThemes]);

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
        {themes?.length ? (
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
                          저장해두기
                        </Button>
                        {/* <MdBookmarkBorder onClick={() => handleAddPinnedTheme(themeItem.theme)} className="cursor-pointer"/> */}
                      </Col>
                    </Row>
                    {themeItem?.expressions?.map((exp, i) => {
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
                              저장해두기
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
                      >
                        + 다른 표현 보기
                      </Button>
                    </Row>
                  </Col>
                )
              )}
            </Space>
          </div>
        ) : (
          'Loading themes'
        )}
      </div>
    </Drawer>
  );
};

export default ThemeBox;
