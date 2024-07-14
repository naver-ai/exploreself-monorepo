import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IEvent {
  type: string;
  message: string;
  timestamp: string;
  importance: number; // From 1~10? TODO: experiment with string (description) rather than number
}
interface IUserState {
  uid: string;
  isLoggedIn: boolean;
  initial_narrative: string;
  value_set: string;
  memo: string;
  event_history: IEvent[];
}

const initialState : IUserState = {
  uid: "",
    isLoggedIn: false,
    initial_narrative: "",
    value_set: "",
    memo: "",
    event_history: [], // TODO: experiment with chat-log, or plain text
    // History type: typical Q&A log, memo, active update (change in response), keyword selection, 
    // TODO: set interface per history type
    // TODO: Change update 하려면 id가 필요하고, 이건 db랑 직접 소통하는게 나을 것 같기도 
    // TODO: some schema might be beneficial to be unified with DB, some not --- 언제 DB/redux를 sync하고, 언제 DB에서 가져오고 redux에서 가져올지 결정
}

const userSlice = createSlice({
  name: 'USER',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.isLoggedIn = true;
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
      state.event_history.push(action.payload.event)
    },
    updateMemo: (state, action) => {
      state.memo = action.payload.memo;
    },
    updateHistory: (state, action) => {
      // TODO: variation per event type -- switch
      // addThemeToBookmark; activateTheme; deleteTheme; deactivateTheme; updateMemo; updateResponse;  
      state.event_history.push(action.payload.event)
    }
  }
})

export const {loginUser, setInitialNarrative, setValueSet, updateValueSet, updateMemo, updateHistory} = userSlice.actions;
export default userSlice.reducer;
