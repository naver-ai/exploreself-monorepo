import { useCallback, useEffect, useMemo, useState } from 'react'
import getThreadTitleList from '../../../api_call/old/getThreadTitleList'
import { Divider, Timeline, FloatButton } from 'antd'
import createThreadItem from '../../../api_call/createThreadItem'
import {fetchUserInfo, removePinnedTheme} from '../reducer'
import { useDispatch, useSelector } from '../../../redux/hooks'
import { title } from 'process'
import { IThreadWithQuestionIds } from '@core'
import { ListBulletIcon, BookmarkIcon } from '@heroicons/react/20/solid'
import { FolderOutlined} from '@ant-design/icons';



const Sidebar = () => {

  const threadIds = useSelector(state => state.explore.threadRef)
  const token = useSelector((state) => state.auth.token) as string

  const [threadTitleList, setThreadTitleList] = useState<IThreadWithQuestionIds[] | null>()
  const dispatch = useDispatch()

  const fetchThreadTitleList = useCallback(async() => {
      const titleList = await getThreadTitleList(token, threadIds)
      if(titleList){
        setThreadTitleList(titleList)
      }
  }, [threadIds])

  const themeListTimelineItems = useMemo(()=>{
    const timelineItems = threadTitleList?.map(thread => {
      return {children: thread.theme}
    }) || []
    return [{children: '처음 적었던 고민'}].concat(timelineItems)
  } ,[threadTitleList])

  const uid = useSelector((state) => state.explore.userId)
  const pinnedThemes = useSelector((state) => state.explore.pinned_themes)
  
  useEffect(() => {
    fetchThreadTitleList()
  },[threadIds])

  const addToThread = useCallback(async (selected: string) => {
    if(uid != null){
      const tid = await createThreadItem(token, selected)
      dispatch(removePinnedTheme(selected))
      dispatch(fetchUserInfo())
    }
  }, [uid])
  
  return (
    <div className='m-2'>
      <div className='font-bold text-sm my-3 flex items-center gap-1 mb-5'><ListBulletIcon className='w-4 h-4'/><span>개요</span></div>
      <Timeline className='px-1' items={themeListTimelineItems}/>
      <div className='font-bold text-sm my-3 flex items-center gap-1 mb-5'><FolderOutlined className='w-4 h-4'/><span>주제 바구니</span></div>
      {pinnedThemes?.map((theme, i) => 
      <div key={i} onClick={() => addToThread(theme)}>{theme}</div>
      )}
    </div>
  )
}

export default Sidebar;