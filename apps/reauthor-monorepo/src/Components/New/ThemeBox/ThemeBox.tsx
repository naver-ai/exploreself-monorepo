import getInitialThemes from '../../../APICall/getInitialThemes'
import { useEffect, useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { Button, Radio, Space, Input } from 'antd';
import {addPinnedTheme, resetPinnedThemes, setWorkingThread} from '../../../Redux/reducers/userSlice' 
import { useDispatch, useSelector } from 'react-redux';
import createThreadItem from '../../../APICall/createThreadItem';
import { IRootState } from "apps/reauthor-monorepo/src/Redux/store"
import { MdBookmarkBorder } from "react-icons/md";
import getThemesFromResp from '../../../APICall/getThemesFromResp';

const ThemeBox = (props:{
  onThreadCreated: () => void; 
}) => {
  const [themes, setThemes] = useState([]);
  const [respThemes, setRespThemes] = useState([]);
  const [selected, setSelected] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch();
  const uid = useSelector((state: IRootState) => state.userInfo.uid)
  const fetchInitThemes = async () => {
    const data = await getInitialThemes(uid);
    console.log("THEMES: ", data)
    // console.log("THEMES: ", data.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme))
    setThemes(data);
  };

  const fetchThemesFromRef = async() => {
    const data = await getThemesFromResp(uid);
    console.log("RESPTHEME: ", data)
    setRespThemes(data)
  }

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
    const tid = await createThreadItem(uid, selected)
    dispatch(setWorkingThread({tid: tid, theme: selected}))
    props.onThreadCreated()
    // TODO: Dispatch working thread id
  }

  useEffect(() => {
    fetchInitThemes();
    fetchThemesFromRef();
    console.log("RES: ", respThemes)
  },[])

  return (
    <div>
      {themes.length?
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