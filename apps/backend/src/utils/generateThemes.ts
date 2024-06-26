import { ChatOpenAI } from '@langchain/openai';
import {ChatPromptTemplate, HumanMessagePromptTemplate} from "@langchain/core/prompts"
import {SystemMessage} from "@langchain/core/messages"
import {z} from "zod";

const generateThemes = async (mode, history, additional_instructions='') => {

  // TODO: mode setting
  // mode 0: extract initial (theme, quote) pair
  // mode 1: exploration themes
  // 그냥 함수를 따로 만들기
  const model = new ChatOpenAI({
    model: "gpt-4o"
  });

  const most_recent_input = history.most_recent_input

  const systemMessage = new SystemMessage(`
  You are an assistant that helps user explore and examin one's personal narrative for them to understand it better, in an empowering way. 
  The user will share one's personal narrative with you. 
  Your task is to identify 10 themes that the user can explore further. 
  The themes that you elicit will be directly be delivered to the user themselves, and they should feel inviting for the users.  
  Do not assume the user's emotions or thoughts based on the situation described. 
  Please ensure that these themes are directly derived from the user's own words and expressions. 
  Instead, focus on using the exact language and phrases used by the user. 
  The themes should be framed in a way that would likely engage and be inviting the user and highlight important aspects of their experience.
  Also, it's important to use the user's expression as much as possible. 
  Never judge or assume anything that would stigmatize oneself. They will not feel inviting to explore further. 
  Also, for each theme, also retrieve the most relevant part (It could be sentence(s), phrase(s) in the narrative, with each theme)
  User narrative: 
  `);

  const humanTemplate = "User's narrative: {user_narrative}"

  const humanMessage = HumanMessagePromptTemplate.fromTemplate(humanTemplate)

  // const narrative_kor = `
  // 저는, 중학교 때부터 저는 항상 사람들의 이목에서 벗어나 저 혼자 조용히 일하는 것을 좋아했습니다. 
  // 사람들 눈에 띄지 않고, 조용히 성실히 일하는 것을 선호했고, 사회적 상호작용도 늘 절제되고 눈에 띄지 않았습니다. 
  // 그러나 최근에 제가 일하는 곳에서 저만의 이런 평온이 깨졌습니다. 예상치 못하게 저희 회사 메인 프로젝트의 리더로 선정되었기 때문이에요. 
  // 이 프로젝트는 회사에서 정말 중요한 프로젝트이고, 제가 부서 전체의 프레젠테이션을 맡게 되어, 평소 늘 피하고자 했던 스포트라이트 앞에 서게 되었습니다. 
  // 수많은 사람들 앞에서 발표하고 이끌어야 한다는 생각에, 저는 전에 경험해보지 못했던 극심한 두려움을 느끼게 되었고, 이 일을 앞두고 도통 밤에 잠을 자지 못하고 있어요.  
  // `

  // const formattedHumanMessage = await humanMessage.format({user_narrative: narrative_kor})

  const edgeSchema = z.object({
    themes: z.array(z.object({
      theme: z.string().describe("Each theme from the personal narrative shared by a user."),
      quote: z.string().describe("Most relevant part of the user's narrative to the theme")
    }))
  })

  const finalPromptTemplate = ChatPromptTemplate.fromMessages([
    systemMessage,
    humanMessage
  ])

  const structuredLlm = model.withStructuredOutput(edgeSchema);

  const chain = finalPromptTemplate.pipe(structuredLlm);

  const result = await chain.invoke({user_narrative: most_recent_input});

  console.log("Theme result: ", result)

  return result;
} 

export default generateThemes;