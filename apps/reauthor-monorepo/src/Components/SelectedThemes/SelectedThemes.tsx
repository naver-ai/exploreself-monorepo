import { useSelector } from "react-redux";
import userSlice, { ITheme } from "../../Redux/reducers/userSlice";
import { useEffect, useState } from "react";
import { IRootState } from "../../Redux/store";
import { IUserState } from "../../Redux/reducers/userSlice";
import {generateQuestionFromContext} from '../../Utils/generateQuestion'
import { generateGranularItems } from '../../Utils/generateScaffolding'
import breakDownQuestion from "../../Utils/breakDownQuestion";
import TextArea from "antd/es/input/TextArea";
import { Button } from "antd";
import { CheckCircleOutlined } from '@ant-design/icons';
import SelectedThemeItem from "./SelectedThemeItem";


const SelectedThemes = () => {
  const initialNarrative = useSelector((state: IRootState) => state.userInfo.initial_narrative)
  const themes: ITheme[] = useSelector((state: IRootState) => state.userInfo.themes)
  const [activatedThemes, setActivatedThemes] = useState<ITheme[]>(themes.filter((theme) => theme.activated))
  useEffect(() => {
    setActivatedThemes(themes.filter((theme) => theme.activated))
  },[themes])

  return (
    <div>
      SELECTED THEMES{"\n"}
      {activatedThemes.map((theme: ITheme) => {
        return <SelectedThemeItem theme={theme} initialNarrative={initialNarrative}/>
      })}
    </div>
  )
}

export default SelectedThemes;