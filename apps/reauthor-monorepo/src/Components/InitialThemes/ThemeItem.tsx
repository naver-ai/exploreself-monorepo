import { generate } from "@langchain/core/dist/utils/fast-json-patch"
import { chatModel } from "../../config"

// TODO: history는 redux에 넣어두기 

const ExpressionItem = (props: {
  expression: string
}) => {
  const generateQuestionSet = () => {

  }

  return(
    <div>
      {props.expression}
      <button onClick={generateQuestionSet}>select</button>
    </div>
  )
}

const ThemeItem = (props:{
  theme: Array<string>
}) => {
  return(
    <div className='border border-black'>
      <ul>
        {props.theme.map((exp, index) => {
          return <ExpressionItem expression={exp}/>
        })}
      </ul>
    </div>
  )
}
export default ThemeItem;