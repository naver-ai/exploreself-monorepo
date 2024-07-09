// import { generateNewQuestion } from "./generateQuestion";
// import generateThemes from "./generateThemes"
// import { History } from "../interfaces";
// import generatePlausibleAnswers from "./generatePlausibleAnswers";

// const createAnswerCallback = (rl, optionSet: {[key: string]: any}, history: History={}) => {
//   /*
//   rl: CLI
//   optionSet: selection set 
//   mode 0: theme + mode selection -> question을 제공해준다. 
//   mode 1: input 제공 -> theme들을 제공해준다.  
//   */
//   // mode에 따라서도 input을 처리하는 방식이 달라짐. 
//   // mode 0: option에서 selection. 
//   // mode 1: 그냥 input 그대로
//   // 
//   let mode = 0;
//   const answerCallback = async (user_input) => {

//     let most_recent_input;
//     let question;
//     let deliver;
    
//     switch (mode) {
//       case 0:
//         const selection = optionSet[user_input].theme
//         console.log("Selection: ", selection)
//         question = await generateNewQuestion(1, history, selection)
//         history.most_recent_question = question;
//         deliver = await generatePlausibleAnswers(history.most_recent_question, history.most_recent_input)
//         console.log("HISTORY: ", history)
//         console.log("Deliver: ", deliver)
//         break;
//       case 1:
//         most_recent_input = user_input
//         history.stacked_input = (history.stacked_input || '') + (history.most_recent_question || '') + (history.most_recent_input || '');
//         history.most_recent_input = user_input
//         console.log("Updated history: ", history)
//         deliver = await generateThemes(1, history)
//         break;
//       default:
//         console.error('Invalid mode');
//         rl.close();
//         return;
//     }

//     mode = 1-mode
//     rl.question(deliver, answerCallback)
//   }
//   return answerCallback;
// }

// export default createAnswerCallback;