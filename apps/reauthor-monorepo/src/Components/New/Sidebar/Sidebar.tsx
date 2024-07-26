import { useCallback, useEffect, useState } from 'react'
import getThreadTitleList from '../../../APICall/old/getThreadTitleList' 
import { IThreadItem } from 'apps/reauthor-monorepo/src/Config/interface'
import { Divider } from 'antd'
import createThreadItem from '../../../APICall/createThreadItem'
import {fetchUserInfo, removePinnedTheme} from '../../../Redux/reducers/userSlice'
import { useDispatch, useSelector } from '../../../Redux/hooks'
import { title } from 'process'
import { IThreadWithQuestionIds } from '@core'


const Sidebar = () => {

  const threadIds = useSelector(state => state.userInfo.threadRef)
  const token = useSelector((state) => state.userInfo.token) as string

  const [threadTitleList, setThreadTitleList] = useState<IThreadWithQuestionIds[] | null>()
  const dispatch = useDispatch()

  const fetchThreadTitleList = useCallback(async() => {
      const titleList = await getThreadTitleList(token, threadIds)
      if(titleList){
        setThreadTitleList(titleList)
      }
  }, [threadIds])

  const uid = useSelector((state) => state.userInfo.userId)
  const pinnedThemes = useSelector((state) => state.userInfo.pinned_themes)
  
  useEffect(() => {
    fetchThreadTitleList()
  },[threadIds])

  const addToThread = useCallback(async (selected: string) => {
    if(uid != null){
      const tid = await createThreadItem(uid, selected)
      dispatch(removePinnedTheme(selected))
      dispatch(fetchUserInfo())
    }
  }, [uid])
  
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