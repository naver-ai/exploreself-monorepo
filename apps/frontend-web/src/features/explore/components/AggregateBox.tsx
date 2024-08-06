import { useSelector } from '../../../redux/hooks';
import { useTranslation } from 'react-i18next';
import { questionSelectors } from '../reducer';


export const AggregateBox = () => {
  const [t] = useTranslation()
  
  const allQuestions = useSelector((state) => questionSelectors.selectAll(state));
  const filteredQuestions = allQuestions
    .filter(q => q.response && q.response.length > 0)

    return (
    <div>
      {filteredQuestions.map(q => 
      <div>
        {/*Design TBD*/}
        <div>Question: {q.question.content}</div>
        <div>Response: {q.response}</div>
      </div>)}
    </div>
  )
}