import { useDispatch, useSelector } from '../../../redux/hooks';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useCallback, useEffect } from 'react';
import { getNewSynthesis } from '../reducer';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';


const SynthesisBox = () => {
  const synthesisList: string[] = useSelector(state => state.explore.synthesis)
  const isCreatingSynthesis = useSelector(state => state.explore.isCreatingSynthesis)
  const dispatch = useDispatch();
  const handleGenerateSynthesis = useCallback(async () => {
    dispatch(getNewSynthesis())
  },[])
  const [t] = useTranslation()
  return (
    <div>
      {synthesisList.length > 0 ? <div>{synthesisList[synthesisList.length -1]}<Button onClick={handleGenerateSynthesis}>Get new</Button></div>: <Button onClick={handleGenerateSynthesis}>Create synthesis</Button>}
      {isCreatingSynthesis && <LoadingIndicator title="fetching synthesis"/>}
    </div>
  )
}

export default SynthesisBox;
