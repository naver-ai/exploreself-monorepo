import { useDispatch, useSelector } from '../../../redux/hooks';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useCallback, useEffect } from 'react';
import { getNewSummary } from '../reducer';
import { useTranslation } from 'react-i18next';
import { Button, Carousel } from 'antd';
import { useAgendaIdInRoute } from '../hooks';
import { usePrevious } from '@uidotdev/usehooks';

export const SummaryPanel = () => {
  const agendaId = useAgendaIdInRoute()
  const prevAgendaId = usePrevious(agendaId)
  const summaryList: string[] = useSelector(state => state.agenda.summaries)
  const isCreatingSummary = useSelector(state => state.agenda.isCreatingSummary)
  const dispatch = useDispatch();
  
  const handleGenerateSummary = useCallback(async () => {
    dispatch(getNewSummary())
  },[])

  const [t] = useTranslation()

  useEffect(()=>{
    if(prevAgendaId != agendaId && summaryList.length == 0){
      dispatch(getNewSummary())
    }
  }, [prevAgendaId, agendaId, summaryList.length])

  return (
    <div className='bg-white p-8 rounded-xl'>
      <div className='flex justify-between'>
      <div className='mb-5 font-bold text-xl'>{t("Summary.Title")}</div>
      <div className='justify-end'>
        {isCreatingSummary? <LoadingIndicator title={t("Summary.Generating")}/>: <Button onClick={handleGenerateSummary} disabled={isCreatingSummary}>{t("Summary.More")}</Button>}
      </div>
      </div>
      {summaryList.length > 0 ? 
      <Carousel 
      arrows = {summaryList.length > 1}
      className='custom-carousel h-full'
      initialSlide={summaryList.length > 0? summaryList.length -1: 0}>
      {summaryList?.map((item, i) => 
        <div className='rounded-lg flex items-center justify-center' key={i}>
          <div className='flex items-center justify-center px-10 pb-10 leading-loose h-full'>
            {item}
          </div>
        </div>)}
    </Carousel> : <div>{t("Summary.NoSummaries")}</div>
      }
      
    </div>
  )
}