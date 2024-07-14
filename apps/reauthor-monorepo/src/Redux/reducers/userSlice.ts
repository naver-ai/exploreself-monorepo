import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HistoryItem } from "../../Utils/interface";

interface UserState {
  uid: string;
  isLoggedIn: boolean;
  initial_narrative: string;
  value_set: string;
  memo: string;
  history: HistoryItem[];
}

const initialState : UserState = {
  uid: "",
    isLoggedIn: false,
    initial_narrative: "",
    value_set: "",
    memo: "",
    history: [], // TODO: experiment with chat-log, or plain text
    // History type: typical Q&A log, memo, active update (change in response), keyword selection, 
    // TODO: set interface per history type
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
    setValueSet: (state, action) => {
      state.value_set = action.payload
    },
    updateMemo: (state, action) => {
      state.memo.concat(action.payload)
    },
    updateHistory: (state, action: PayloadAction<HistoryItem>) => {
      state.history.push(action.payload)
    }
  }
})

export const {loginUser, setInitialNarrative, setValueSet, updateMemo, updateHistory} = userSlice.actions;
export default userSlice.reducer;
