import { useSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import { questionSelectors } from '../reducer';
import {Divider, Flex} from 'antd'
import {useRef} from'react'
import { IQASetWithIds } from '@core';



export const AggregateBox = () => {
  const [t] = useTranslation()
  const allQuestions = useSelector((state) => questionSelectors.selectAll(state));
  const filteredQuestions = allQuestions
    .filter(q => q.response && q.response.length > 0)
  
  const name = useSelector(state => state.explore.name)
  const initNarrative = useSelector(state => state.explore.initialNarrative)

    return (
    //   <div className='bg-white p-8 rounded-xl h-[100vh]'>
    //   {props.questions.map((question) => (
    //     <div
    //       className='pb-10'
    //       key={question._id}
    //       ref={(el) => (props.questionRefs.current[question._id] = el)}
    //     >
    //       <Flex vertical={false}>
    //        <div className="pb-2 pl-1"><span className='text-teal-500 text-3xl font-light italic'>Q.</span>  {question.question.content} </div>
    //       </Flex>
    //       {question.response}
    //     </div>
    //   ))}
    // </div>
    <div className='bg-white p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
      <div className='mb-5 font-bold text-xl'>{name}{t("Synthesis.Aggregate")}</div>
      <div className='border p-5 rounded-lg mb-5 leading-7'>
        {initNarrative}
      </div>
      {filteredQuestions.map(q => 
      <div className='pb-2' key={q._id}>
        <div className="pb-2 pl-1 flex items-baseline gap-x-2"><span className='text-teal-500 text-3xl font-light italic'>Q.</span> <span className='font-semibold'>{q.question.content}</span> </div>
        <div className='ml-10 mt-2 p-2 bg-slate-100'>{q.response}</div>
      </div>)}
    </div>
  )
}