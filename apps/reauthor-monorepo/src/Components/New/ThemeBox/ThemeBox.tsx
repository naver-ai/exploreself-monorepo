import getInitialThemes from '../../../APICall/getInitialThemes'
import { useEffect, useState } from "react";
import type { RadioChangeEvent } from 'antd';
import { Button, Radio, Space, Input } from 'antd';
import {setWorkingThread} from '../../../Redux/reducers/userSlice' 
import { useDispatch, useSelector } from 'react-redux';
import createThreadItem from '../../../APICall/createThreadItem';
import { IRootState } from "apps/reauthor-monorepo/src/Redux/store"

const ThemeBox = (props:{
  onThreadCreated: () => void; 
}) => {
  const [themes, setThemes] = useState([]);
  const [selected, setSelected] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch();
  const uid = useSelector((state: IRootState) => state.userInfo.uid)
  const fetchInitThemes = async () => {
    const data = await getInitialThemes();
    // console.log("THEMES: ", data.themes.map((themeItem: { theme: string; quote: string }) => themeItem.theme))
    setThemes(data);
  };

  const onChange = (e: RadioChangeEvent) => {
    setSelected(e.target.value)
  }
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelected(e.target.value);
  };

  const onSubmit = async () => {
    // TODO: Handling when input value is empty
    console.log("ONSUBUID: ", uid)
    const tid = await createThreadItem(uid, selected)
    dispatch(setWorkingThread({tid: tid, theme: selected}))
    props.onThreadCreated()
    // TODO: Dispatch working thread id
  }

  useEffect(() => {
    fetchInitThemes();
  },[])
  return (
    <div>
      {themes.length?
      <div>
      <Radio.Group onChange={onChange} value={selected}>
        <Space direction="vertical">
        {themes.map((themeItem: { theme: string; quote: string }) => <Radio value={themeItem.theme}>{themeItem.theme}</Radio>)}
        <Radio value={inputValue}><Input style={{ width: 100, marginLeft: 10 }} onChange={onInputChange}/></Radio>
        </Space>
      </Radio.Group>
      <Button onClick={onSubmit}>Selected</Button>
      </div>
      
      :"Loading themes"}
    </div>
  )
}

export default ThemeBox;