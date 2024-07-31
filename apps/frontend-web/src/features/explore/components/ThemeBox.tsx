import { useCallback, useEffect, useState } from 'react';
import type { RadioChangeEvent } from 'antd';
import { Button, Row, Space, Col, Drawer } from 'antd';
import {
  addPinnedTheme,
  fetchUserInfo,
  resetPinnedThemes,
  setThemeSelectorOpen,
  setWorkingThread,
} from '../reducer';
import createThreadItem from '../../../api_call/createThreadItem';
import { MdBookmarkBorder } from 'react-icons/md';
import { useDispatch, useSelector } from '../../../redux/hooks';
import generateThemes from '../../../api_call/generateThemes';
import { CloseOutlined } from '@ant-design/icons';

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

  const handleAddPinnedTheme = (theme: string) => {
    dispatch(addPinnedTheme(theme));
  };

  const onChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value);
  };

  const onChangeSelect = (theme: string) => {
    // dispatch(resetPinnedThemes())
    setSelected(theme);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelected(e.target.value);
  };

  const onSubmit = async () => {
    // TODO: Handling when input value is empty
    const tid = await createThreadItem(token, selected);
    dispatch(setWorkingThread({ tid: tid, theme: selected }));
    dispatch(fetchUserInfo());
    // TODO: Dispatch working thread id
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
                (themeItem: { theme: string; quote: string }, index) => (
                  <Col className="border-2 border-slate-300 w-full rounded-lg p-3">
                    <Row
                      key={index}
                      className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md"
                      onClick={() => onChangeSelect(themeItem.theme)}
                      justify="space-between"
                    >
                      <Col className="pl-2">{themeItem.theme}</Col>
                      <Col>
                        <Button
                          icon={<MdBookmarkBorder />}
                          onClick={() => handleAddPinnedTheme(themeItem.theme)}
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
