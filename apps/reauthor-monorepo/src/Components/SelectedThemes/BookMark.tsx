import useSelection from "antd/es/table/hooks/useSelection"
import { useDispatch, useSelector } from "react-redux"
import { IUserState } from "../../Redux/reducers/userSlice"
import { IRootState } from "../../Redux/store"
import { Content } from "antd/es/layout/layout"
import { removeTheme, activateTheme, inActivateTheme } from "../../Redux/reducers/userSlice"
import { theme, Space } from "antd"
import { PushpinOutlined } from '@ant-design/icons';


const BookMarkItem = (props:{
  content: string,
  isActivated: boolean
}) => {
  const dispatch = useDispatch()
  const themes = useSelector((state: IRootState) => state.userInfo.themes)


  const deleteFromBookmark = () => {
    console.log("CONENT: ", props.content)
    dispatch(removeTheme(props.content))
    
  }
  const activateFromBookmark = () => {
    dispatch(activateTheme(props.content))
  }
  const inActivateFromBookmark = () => {
    dispatch(inActivateTheme(props.content))
  }
  const styleVariants = {
    activated: 'bg-blue-600',
    inactivated: 'bg-black-400'
  }
  return(
    <div>
      <Space className="bg-violet-50 px-2" >
      <PushpinOutlined/>
      <div className={`${props.isActivated? styleVariants.activated: styleVariants.inactivated}`}>{props.content}</div>
      </Space>
      
      
      <button onClick={activateFromBookmark}>[Activate]</button>
      <button onClick={inActivateFromBookmark}>[Inactivate]</button>
      <button onClick={deleteFromBookmark}>[Delete]</button>
    </div>
  )
}

const BookMark = () => {
  const themes = useSelector((state: IRootState) => {
    console.log("STATE: ", state.userInfo.themes)
    return state.userInfo.themes
  })
  return(
    <div>
      BOOKMARK
      {themes?.map((theme, index) => {
        // TODO: design based on activation, buttons for activating 
        console.log("THEME: ", theme)
        return <BookMarkItem content={theme.theme} isActivated={theme.activated}/>
      })}
    </div>
  )
}
export default BookMark;