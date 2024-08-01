import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserWithThreadIds } from '@core';
import { Http } from '../../net/http';
import { AppThunk } from '../../redux/store';


export type IExploreState = {
  isLoadingUserInfo: boolean;
  userId?: string;
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

  pinned_themes: []
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
  resetState,
  setThemeSelectorOpen,
} = exploreSlice.actions;
export default exploreSlice.reducer;
