import { useCallback, useEffect, useState } from 'react'
import getThreadTitleList from '../../../APICall/getThreadTitleList' 
import { IThreadItem } from 'apps/reauthor-monorepo/src/Config/interface'
import { Divider } from 'antd'
import createThreadItem from '../../../APICall/createThreadItem'
import {fetchUserInfo, removePinnedTheme} from '../../../Redux/reducers/userSlice'
import { useDispatch, useSelector } from '../../../Redux/hooks'


const Sidebar = () => {

  const threadIds = useSelector(state => state.userInfo.threadRef)

  const [threadTitleList, setThreadTitleList] = useState<IThreadItem[] | null>()
  const dispatch = useDispatch()

  const fetchThreadTitleList = useCallback(async() => {
      const titleList = await getThreadTitleList(threadIds)
      setThreadTitleList(titleList)
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