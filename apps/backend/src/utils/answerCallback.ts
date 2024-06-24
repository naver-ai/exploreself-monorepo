import generateQuestions from "./generateQuestion"
import generateThemes from "./generateThemes"

const createAnswerCallback = (rl, optionSet, history, mode) => {
  /*
  rl: CLI
  optionSet: selection set 
  mode 0: theme + mode selection -> question을 제공해준다. 
  mode 1: input 제공 -> theme들을 제공해준다.  
  */
  const genFunc = mode? generateQuestions: generateThemes

  const answerCallback = (selection) => {
    const user_input = optionSet[selection]
    console.log("Selected:", user_input)
    const deliver = genFunc(history, user_input, mode)
    rl.question(deliver, answerCallback)
  }
  return answerCallback;
}

export default createAnswerCallback;