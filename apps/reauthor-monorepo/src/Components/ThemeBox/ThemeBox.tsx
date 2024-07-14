import QuestionItem from "./QuestionItem"

const ThemeBox = (props:{
  theme: string
}) => {
  return(
    <div>
      Theme: {props.theme}
    </div>
  )
}

export default ThemeBox;