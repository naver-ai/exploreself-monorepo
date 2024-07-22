import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IThreadItem } from "../../Config/interface";

interface IEvent {
  type: string;
  message: string;
  timestamp: string;
  weight: number; // From 1~10? TODO: experiment with string (description) rather than number
}
interface IUserState {
  uid: string;
  is_logged_in: boolean;
  initial_narrative: string;
  value_set: string[];
  background: string[];
  event_history: IEvent[];
  question_stack: string[];
  working_thread: IThreadItem;
}

const initialState : IUserState = {
  uid: "668bcb49eea1742b895f0fe8",
  is_logged_in: true,
  initial_narrative: `저는, 중학교 때부터 저는 항상 사람들의 이목에서 벗어나 저 혼자 조용히 일하는 것을 좋아했습니다. 사람들 눈에 띄지 않고, 조용히 성실히 일하는 것을 선호했고, 사회적 상호작용도 늘 절제되고 눈에 띄지 않았습니다. 그러나 최근에 제가 일하는 곳에서 저만의 이런 평온이 깨졌습니다. 예상치 못하게 저희 회사 메인 프로젝트의 리더로 선정되었기 때문이에요. 이 프로젝트는 회사에서 정말 중요한 프로젝트이고, 제가 부서 전체의 프레젠테이션을 맡게 되어, 평소 늘 피하고자 했던 스포트라이트 앞에 서게 되었습니다. 수많은 사람들 앞에서 발표하고 이끌어야 한다는 생각에, 저는 전에 경험해보지 못했던 극심한 두려움을 느끼게 되었고, 이 일을 앞두고 도통 밤에 잠을 자지 못하고 있어요.`,
  value_set: [],
  background: ["저는 두 아이의 아빠이자, 회사의 직원이에요"],
  event_history: [], // TODO: experiment with chat-log, or plain text
  // History type: typical Q&A log, memo, active update (change in response), keyword selection, 
  // TODO: set interface per history type
  // TODO: Change update 하려면 id가 필요하고, 이건 db랑 직접 소통하는게 나을 것 같기도 
  // TODO: some schema might be beneficial to be unified with DB, some not --- 언제 DB/redux를 sync하고, 언제 DB에서 가져오고 redux에서 가져올지 결정
  question_stack: [],
  working_thread: {
    tid: '',
    theme: ''
  } as IThreadItem
}

const userSlice = createSlice({
  name: 'USER',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.is_logged_in = true;
    },
    setInitialNarrative: (state, action) => {
      state.initial_narrative = action.payload
    },
    // TODO: consider whether to change in Initial Narrative
    setValueSet: (state, action) => {
      state.value_set = action.payload
    },
    updateValueSet: (state, action) => {
      state.value_set = action.payload.value_set;
      // state.event_history = [...state.event_history, action.payload.event]
    },
    addBackground: (state, action) => {
      state.background = [...state.background, action.payload];
      // TODO: Update history
    },
    deleteBackground: (state, action) =>{
      // TODO: fill in
    },
    updateBackground: (state, action) => {
      // TODO: fill in
    },
    updateEventHistory: (state, action) => {
      // TODO: variation per event type -- switch
      // TODO: Think of all possible events (update in memo/response, get suggestion, open suggestion, select suggestion --- refer to Mina Lee's CoAuthor paper)
      // TODO: Think of granularity and weight of events
      // addThemeToBookmark; activateTheme; deleteTheme; deactivateTheme; updateMemo; updateResponse;  
      state.event_history = [...state.event_history, action.payload.event]
    },
    // addTheme: (state, action) => {
    //   state.themes = [...state.themes, action.payload]
    // },
    // activateTheme: (state, action) => {
    //   state.themes = state.themes.map(theme => theme.theme === action.payload ? {...theme, activated: true}: theme)
    // },
    // inActivateTheme: (state, action) => {
    //   state.themes = state.themes.map(theme => theme.theme === action.payload ? {...theme, activated: false}: theme)
    // },
    // removeTheme: (state, action) => {
    //   // TODO: error handling

    //   state.themes = state.themes.filter(theme => {
    //     console.log("THEME!: ", theme.theme)
    //     console.log("PAyloSD: ", action.payload)
    //     console.log(theme.theme! == action.payload ? "DIF": "SAME")
    //     return theme.theme !== action.payload
    //   })
    // },
    addQuestionStack: (state, action) => {
      state.question_stack = [...state.question_stack, action.payload]
    },
    popQuestionStack: (state, action) => {
      // TODO: error handling
      state.question_stack = state.question_stack.filter(question => question != action.payload)
    },
    setWorkingThread: (state, action) => {
      state.working_thread = action.payload
    },
    resetWorkingThread: (state) => {
      state.working_thread = {
        tid: '',
        theme: ''
      }
    },
    resetState: (state) => {
      state = initialState
    }
  }
})

export {IUserState}
export const {resetWorkingThread, resetState, setWorkingThread, loginUser, setInitialNarrative, setValueSet, updateValueSet, addBackground, updateEventHistory, addQuestionStack, popQuestionStack} = userSlice.actions;
export default userSlice.reducer;
