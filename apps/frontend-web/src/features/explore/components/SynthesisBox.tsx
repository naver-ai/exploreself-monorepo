import { useDispatch, useSelector } from '../../../redux/hooks';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useCallback, useEffect } from 'react';
import { getNewSynthesis } from '../reducer';
import { useTranslation } from 'react-i18next';
import { Button, Carousel } from 'antd';

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
      <div className='flex justify-between'>
      <div className='mb-5 font-bold text-xl'>{t("Synthesis.Open")}</div>
      <div className='justify-end'>
        {isCreatingSynthesis? <LoadingIndicator title={t("Synthesis.Generating")}/>: <Button onClick={handleGenerateSynthesis} disabled={isCreatingSynthesis}>{t("Synthesis.More")}</Button>}
      </div>
      </div>
      {synthesisList.length && 
      <Carousel 
      arrows
      className='custom-carousel h-full'
      initialSlide={synthesisList.length > 0? synthesisList.length -1: 0}>
      {synthesisList?.map((item, i) => 
        <div className='rounded-lg flex items-center justify-center' key={i}>
          <div className='flex items-center justify-center px-20 pb-10 leading-loose h-full'>
            {item}
          </div>
        </div>)}
    </Carousel>
      }
      
    </div>
  )
}

export default SynthesisBox;
