import { Request, Response } from 'express';
import generateThemes from '../utils/generateThemes';
import createAnswerCallback from '../utils/answerCallback';
import { History } from '../utils/interfaces';
const readline = require("readline")

const generateThemesMiddleware = async (req: Request, res: Response) => {
  // const narrative = req.body.narrative;

  const narrative_kor = `
  저는, 중학교 때부터 저는 항상 사람들의 이목에서 벗어나 저 혼자 조용히 일하는 것을 좋아했습니다. 
  사람들 눈에 띄지 않고, 조용히 성실히 일하는 것을 선호했고, 사회적 상호작용도 늘 절제되고 눈에 띄지 않았습니다. 
  그러나 최근에 제가 일하는 곳에서 저만의 이런 평온이 깨졌습니다. 예상치 못하게 저희 회사 메인 프로젝트의 리더로 선정되었기 때문이에요. 
  이 프로젝트는 회사에서 정말 중요한 프로젝트이고, 제가 부서 전체의 프레젠테이션을 맡게 되어, 평소 늘 피하고자 했던 스포트라이트 앞에 서게 되었습니다. 
  수많은 사람들 앞에서 발표하고 이끌어야 한다는 생각에, 저는 전에 경험해보지 못했던 극심한 두려움을 느끼게 되었고, 이 일을 앞두고 도통 밤에 잠을 자지 못하고 있어요.  
  `  
  const narrative_eng = `
  Ever since middle school, I've always seen myself as someone who thrives in the shadows, away from the glaring spotlight of public attention. 
  I preferred to keep my head down, diligently working in quiet solitude, and my social interactions were always subtle, never the center of attention. 
  But recently, my usual tranquility at work was disrupted when I was unexpectedly chosen to lead a major project. 
  This wasn't just any project; it involved a division-wide presentation, thrusting me into the very spotlight I had always avoided. 
  The thought of standing in front of all those people, having to lead and direct, filled me with an intense dread that was completely new to me. 
  `

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const history: History = {
    most_recent_input: narrative_eng,
    most_recent_question: '',
    stacked_input: ''
  }

  const initial_edges = await generateThemes(0, history);

  // console.log("EDGES: ", initial_edges.themes)

  const answerCallback = createAnswerCallback(rl, initial_edges.themes, history)

  rl.question('What theme would you like to explore?\n(Select by index): ',answerCallback)

  res.json(initial_edges)
}

export default generateThemesMiddleware;