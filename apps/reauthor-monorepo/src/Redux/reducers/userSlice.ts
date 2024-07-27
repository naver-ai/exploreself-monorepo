import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IThreadItem } from '../../Config/interface';
import { IUserBase, IUserWithThreadIds } from '@core';
import { AppThunk } from '../store';
import { jwtDecode } from 'jwt-decode';
import { Http } from '../../net/http';

export interface IEvent {
  type: string;
  message: string;
  timestamp: string;
  weight: number; // From 1~10? TODO: experiment with string (description) rather than number
}

export type IUserState = {
  isAuthorizing: boolean;
  isLoadingUserInfo: boolean;
  authorizationError?: string;
  token?: string;
  userId?: string;
  event_history: IEvent[];
  question_stack: string[];
  pinned_themes: string[];
  working_thread: IThreadItem;
} & Omit<IUserWithThreadIds, "_id" | "passcode" | "alias" | "createdAt" | "updatedAt">

const initialState: IUserState = {
  isAuthorizing: false,
  isLoadingUserInfo: false,
  authorizationError: undefined,
  token: undefined,
  userId: undefined,
  name: undefined,
  isKorean: false,
  initial_narrative: undefined,
  value_set: [],
  background: undefined,
  threadRef: [],

  event_history: [], // TODO: experiment with chat-log, or plain text
  // History type: typical Q&A log, memo, active update (change in response), keyword selection,
  // TODO: set interface per history type
  // TODO: Change update 하려면 id가 필요하고, 이건 db랑 직접 소통하는게 나을 것 같기도
  // TODO: some schema might be beneficial to be unified with DB, some not --- 언제 DB/redux를 sync하고, 언제 DB에서 가져오고 redux에서 가져올지 결정
  question_stack: [],
  pinned_themes: [],
  working_thread: {
    tid: '',
    theme: '',
  } as IThreadItem,
};

const userSlice = createSlice({
  name: 'USER',
  initialState,
  reducers: {
    mountUser: (
      state,
      action: PayloadAction<{
        token: string;
        userId: string;
        userInfo: IUserWithThreadIds;
      }>
    ) => {
      state.token = action.payload.token

      state.name = action.payload.userInfo.name
      state.isKorean = action.payload.userInfo.isKorean
      state.initial_narrative = action.payload.userInfo.initial_narrative
      state.value_set = action.payload.userInfo.value_set
      state.background = action.payload.userInfo.background

      state.userId = action.payload.userId
      state.authorizationError = undefined
      console.log('UID SET!: ', state.userId);
    },

    updateUserInfo: (state, action: PayloadAction<Partial<IUserWithThreadIds>>) => {
      for(const key of Object.keys(action.payload)){
        (state as any)[key] = (action.payload as any)[key]
      }
      if(action.payload._id != null){
        state.userId = action.payload._id
      }
    },

    setAuthorizingFlag: (state, action: PayloadAction<boolean>) => {
      state.isAuthorizing = action.payload
    },

    setLoadingUserInfoFlag: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUserInfo = action.payload
    },

    setAuthError: (state, action: PayloadAction<string>) => {
      state.authorizationError = action.payload;
    },
    addPinnedTheme: (state, action) => {
      state.pinned_themes = [...state.pinned_themes, action.payload];
    },
    resetPinnedThemes: (state) => {
      state.pinned_themes = [];
    },
    removePinnedTheme: (state, action) => {
      state.pinned_themes = state.pinned_themes.filter(
        (theme) => theme !== action.payload
      );
    },
    deleteBackground: (state, action) => {
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
      state.event_history = [...state.event_history, action.payload.event];
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
      state.question_stack = [...state.question_stack, action.payload];
    },
    popQuestionStack: (state, action) => {
      // TODO: error handling
      state.question_stack = state.question_stack.filter(
        (question) => question != action.payload
      );
    },
    setWorkingThread: (state, action) => {
      state.working_thread = action.payload;
    },
    resetWorkingThread: (state) => {
      state.working_thread = {
        tid: '',
        theme: '',
      };
    },
    resetState: (state) => initialState,
  },
});

// Authentication =====================================================

export function loginWithPasscode(
  passcode: string,
  onSuccess?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    dispatch(userSlice.actions.setAuthorizingFlag(true))
    try {
      const response = await Http.axios.post(`/auth/login`, {
        passcode,
      });
      const { token, user } = response.data;

      const decoded = jwtDecode<{
        sub: string;
        iat: number;
        exp: number;
      }>(token);

      dispatch(
        userSlice.actions.mountUser({
          token,
          userId: decoded.sub,
          userInfo: user,
        })
      );

      onSuccess?.();
    } catch (err) {
      console.log('Err in login: ', err);
      dispatch(userSlice.actions.setAuthError(err as any))
    } finally {
      dispatch(userSlice.actions.setAuthorizingFlag(false))
    }
  };
}

export function signOut(onSuccess?: ()=>{}) : AppThunk {
  return async (dispatch, getState) => {
    dispatch(userSlice.actions.resetState())
    onSuccess?.()
  }
}

// User Info ====================================================================

export function fetchUserInfo(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState()
    if(state.userInfo.token){
      dispatch(userSlice.actions.setLoadingUserInfoFlag(true))
      try {
        const resp = await Http.axios.get("/user", {
          headers: Http.makeSignedInHeader(state.userInfo.token)
        })
        const { user } = resp.data
        console.log(user)
        dispatch(userSlice.actions.updateUserInfo(user))
      }catch(ex) {
        console.log(ex)
      }finally{
        dispatch(userSlice.actions.setLoadingUserInfoFlag(false))
      }
    }
  }
}



export const {
  removePinnedTheme,
  addPinnedTheme,
  resetPinnedThemes,
  resetWorkingThread,
  resetState,
  setWorkingThread,
  updateEventHistory,
  addQuestionStack,
  popQuestionStack,
} = userSlice.actions;
export default userSlice.reducer;
