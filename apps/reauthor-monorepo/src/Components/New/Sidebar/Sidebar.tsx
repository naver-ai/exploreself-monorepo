import { useEffect, useState } from 'react'
import getThreadTitleList from '../../../APICall/getThreadTitleList' 
import { IThreadItem } from 'apps/reauthor-monorepo/src/Config/interface'


const Sidebar = (props:{
  threadRef: string[] | null
}) => {

  const [threadTitleList, setThreadTitleList] = useState<IThreadItem[] | null>()
  const fetchThreadTitleList = async() => {
    if (props.threadRef){
      const titleList = await getThreadTitleList(props.threadRef)
      setThreadTitleList(titleList)
    }
  }
  useEffect(() => {
    fetchThreadTitleList()
  },[props.threadRef])
  return (
    <div>
      <div>Outline: </div>
      {threadTitleList?.map(item => <div>{item.theme}</div>)}
    </div>
  )
}

export default Sidebar;