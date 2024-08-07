import { useDispatch, useSelector } from '../../../redux/hooks';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useCallback, useEffect } from 'react';
import { getNewSynthesis } from '../reducer';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ReactTyped } from "react-typed";

const SynthesisBox = () => {
  const synthesisList: string[] = useSelector(state => state.explore.synthesis)
  const isCreatingSynthesis = useSelector(state => state.explore.isCreatingSynthesis)
  const dispatch = useDispatch();
  const handleGenerateSynthesis = useCallback(async () => {
    dispatch(getNewSynthesis())
  },[])
  const name = useSelector(state => state.explore.name)


  const [t] = useTranslation()
  return (
    <div className='bg-white p-8 rounded-xl'>
      <div className='mb-5 font-bold text-xl'>{t("Synthesis.Open")}</div>
      {synthesisList.length > 0 ? 
        <div className='leading-loose'>
          <ReactTyped
            strings={[synthesisList.join(' ')]}
            typeSpeed={30}
            backSpeed={50}
            loop={false}
          />
        </div>: 
        <div className='bg-white flex justify-center items-center'>
          {isCreatingSynthesis? <LoadingIndicator title={t("Synthesis.Generating")}/>: 
          <Button onClick={handleGenerateSynthesis} type="text">{t("Labels.Press")}</Button>}
        </div>
        }
    </div>
  )
}

export default SynthesisBox;
