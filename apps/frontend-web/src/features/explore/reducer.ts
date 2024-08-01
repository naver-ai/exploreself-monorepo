import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IThreadItem } from '../../config/types';
import { IUserBase, IUserWithThreadIds } from '@core';
import { jwtDecode } from 'jwt-decode';
import { Http } from '../../net/http';
import { AppThunk } from '../../redux/store';

export interface IEvent {
  type: string;
  message: string;
  timestamp: string;
  weight: number; // From 1~10? TODO: experiment with string (description) rather than number
}

export type IExploreState = {
  isLoadingUserInfo: boolean;
  userId?: string;
  event_history: IEvent[];
  question_stack: string[];
  pinned_themes: string[];
  isThemeSelectorOpen: boolean;
} & Omit<
  IUserWithThreadIds,
  '_id' | 'passcode' | 'alias' | 'createdAt' | 'updatedAt'
>;

const initialState: IExploreState = {
  isLoadingUserInfo: false,
  userId: undefined,
  name: undefined,
  isKorean: true,
  initial_narrative: undefined,
  value_set: [],
  background: undefined,
  threads: [],
  isThemeSelectorOpen: false,

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

const exploreSlice = createSlice({
  name: 'EXPLORE',
  initialState,
  reducers: {
    updateUserInfo: (
      state,
      action: PayloadAction<Partial<IUserWithThreadIds>>
    ) => {
      for (const key of Object.keys(action.payload)) {
        (state as any)[key] = (action.payload as any)[key];
      }
      if (action.payload._id != null) {
        state.userId = action.payload._id;
      }
    },

    setThemeSelectorOpen: (state, action: PayloadAction<boolean>) => {
      state.isThemeSelectorOpen = action.payload;
    },

    setLoadingUserInfoFlag: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUserInfo = action.payload;
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

// User Info ====================================================================

export function fetchUserInfo(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token) {
      dispatch(exploreSlice.actions.setLoadingUserInfoFlag(true));
      try {
        const resp = await Http.axios.get('/user', {
          headers: Http.makeSignedInHeader(state.auth.token),
        });
        const { user } = resp.data;
        console.log(user);
        dispatch(exploreSlice.actions.updateUserInfo(user));
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(exploreSlice.actions.setLoadingUserInfoFlag(false));
      }
    }
  };
}

export function submitInitialNarrative(
  narrative: string,
  onSuccess?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.auth.token) {
      dispatch(exploreSlice.actions.setLoadingUserInfoFlag(true));
      try {
        const response = await Http.axios.post(
          `/user/narrative`,
          {
            init_narrative: narrative,
          },
          {
            headers: Http.makeSignedInHeader(state.auth.token),
          }
        );

        dispatch(
          exploreSlice.actions.updateUserInfo({
            initial_narrative: response.data.initial_narrative,
          })
        );

        onSuccess?.();
      } catch (err) {
        console.log('Err in setting narrative: ', err);
      } finally {
        dispatch(exploreSlice.actions.setLoadingUserInfoFlag(false));
      }
    }
  };
}

export function submitUserProfile(
  profile: { name: string },
  onSuccess?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.auth.token) {
      dispatch(exploreSlice.actions.setLoadingUserInfoFlag(true));
      try {
        const response = await Http.axios.post(`/user/profile`, profile, {
          headers: Http.makeSignedInHeader(state.auth.token),
        });

        dispatch(exploreSlice.actions.updateUserInfo(response.data));

        onSuccess?.();
      } catch (err) {
        console.log('Err in setting profile: ', err);
      } finally {
        dispatch(exploreSlice.actions.setLoadingUserInfoFlag(false));
      }
    }
  };
}

export const {
  updateUserInfo,
  removePinnedTheme,
  addPinnedTheme,
  resetPinnedThemes,
  resetWorkingThread,
  resetState,
  setWorkingThread,
  updateEventHistory,
  addQuestionStack,
  popQuestionStack,
  setThemeSelectorOpen,
} = exploreSlice.actions;
export default exploreSlice.reducer;
