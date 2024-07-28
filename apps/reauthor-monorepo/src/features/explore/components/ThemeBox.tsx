import { useCallback, useEffect, useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { Button, Radio, Space, Input } from 'antd';
import {addPinnedTheme, fetchUserInfo, resetPinnedThemes, setWorkingThread} from '../reducer'
import createThreadItem from '../../../api_call/createThreadItem';
import { MdBookmarkBorder } from "react-icons/md";
import { useDispatch, useSelector } from '../../../redux/hooks';
import generateThemes from '../../../api_call/generateThemes';

const ThemeBox = () => {
  const [themes, setThemes] = useState([]);
  const [respThemes, setRespThemes] = useState([]);
  const [selected, setSelected] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) as string

  const fetchInitThemes = useCallback(async () => {
    const data = await generateThemes(token)
    setThemes(data)
  }, [token])

  const handleAddPinnedTheme = (theme: string) => {
    dispatch(addPinnedTheme(theme))
  }

  const onChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }

  const onChangeSelect = (theme: string) => {
    // dispatch(resetPinnedThemes())
    setSelected(theme)
  }
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelected(e.target.value);
  };

  const onSubmit = async () => {
    // TODO: Handling when input value is empty
    const tid = await createThreadItem(token, selected)
    dispatch(setWorkingThread({tid: tid, theme: selected}))
    dispatch(fetchUserInfo())
    // TODO: Dispatch working thread id
  }

  useEffect(() => {
    fetchInitThemes();
  },[fetchInitThemes])

  return (
    <div>
      {themes?.length?
      <div>
      <Space direction='vertical'>
      {themes.map((themeItem: { theme: string; quote: string }, index) => 
        <div key={index} className="flex items-center space-x-2">
          <div 
            onClick={() => onChangeSelect(themeItem.theme)}
            className={`cursor-pointer ${selected === themeItem.theme ? 'bg-blue-500 text-white' : ''}`}
          >
            {themeItem.theme}
          </div>
          <MdBookmarkBorder onClick={() => handleAddPinnedTheme(themeItem.theme)} className="cursor-pointer"/>
        </div>
        )}
      </Space>
      {/* <Radio.Group onChange={onChange} value={selected}>
        <Space direction="vertical">
        {themes.map((themeItem: { theme: string; quote: string }, index) => 
        <div>
          <Radio value={themeItem.theme}>{themeItem.theme}</Radio>
          <MdBookmarkBorder onClick={() => handleAddPinnedTheme(themeItem.theme)}/>
        </div>
        )}
        </Space>
        <Space direction="vertical">
        {respThemes.map((themeItem: { theme: string; quote: string }) => 
        <Radio value={themeItem.theme}>{themeItem.theme}</Radio>)}
        <Radio value={inputValue}><Input style={{ width: 100, marginLeft: 10 }} onChange={onInputChange}/></Radio>
        </Space>
      </Radio.Group> */}
      <Button onClick={onSubmit}>Selected</Button>
      </div>
      
      :"Loading themes"}
    </div>
  )
}

export default ThemeBox;