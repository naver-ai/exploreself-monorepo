import { useEffect, useState } from 'react'
import getThreadTitleList from '../../../APICall/getThreadTitleList' 
import { IThreadItem } from 'apps/reauthor-monorepo/src/Config/interface'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from 'apps/reauthor-monorepo/src/Redux/store'
import { Divider } from 'antd'
import createThreadItem from '../../../APICall/createThreadItem'
import {removePinnedTheme} from '../../../Redux/reducers/userSlice'


const Sidebar = (props:{
  threadRef: string[] | null,
  onThreadCreated: () => void;  
}) => {

  const [threadTitleList, setThreadTitleList] = useState<IThreadItem[] | null>()
  const dispatch = useDispatch()
  const fetchThreadTitleList = async() => {
    if (props.threadRef){
      const titleList = await getThreadTitleList(props.threadRef)
      setThreadTitleList(titleList)
    }
  }
  const uid = useSelector((state: IRootState) => state.userInfo.uid)
  const pinnedThemes = useSelector((state: IRootState) => state.userInfo.pinned_themes)
  useEffect(() => {
    fetchThreadTitleList()
  },[props.threadRef])
  const addToThread = async (selected: string) => {
    const tid = await createThreadItem(uid, selected)
    dispatch(removePinnedTheme(selected))
    props.onThreadCreated()
  }
  return (
    <div>
      <div>Outline: </div>
      {threadTitleList?.map(item => <div>- {item.theme}</div>)}
      <Divider/>
      <div>Pinned themes: </div>
      {pinnedThemes?.map(theme => 
      <div onClick={() => addToThread(theme)}>{theme}</div>
      )}
    </div>
  )
}

export default Sidebar;