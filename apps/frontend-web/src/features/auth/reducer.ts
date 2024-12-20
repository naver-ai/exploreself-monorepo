import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserWithAgendaIds } from '@core';
import { AppThunk } from '../../redux/store';
import { jwtDecode } from 'jwt-decode';
import { Http } from '../../net/http';
import storage from 'redux-persist/lib/storage';
import { updateUserInfo } from '../user/reducer';
import i18next from 'i18next';
import { persistReducer, REHYDRATE } from 'redux-persist';
import { IAdminAuthState } from '../../admin/features/auth/reducer';

export type IAuthState = {
  isAuthorizing: boolean;
  authorizationError?: string;
  token?: string;
  userId?: string;
  locale: string
};

const initialState: IAuthState = {
  isAuthorizing: false,
  authorizationError: undefined,
  token: undefined,
  locale: 'en'
};

const authSlice = createSlice({
  name: 'AUTH',
  initialState,
  reducers: {
    mountUser: (
      state,
      action: PayloadAction<{
        token: string;
        userId: string;
        userInfo: IUserWithAgendaIds;
      }>
    ) => {
      state.token = action.payload.token;

      state.userId = action.payload.userId;
      state.authorizationError = undefined;
      state.locale = action.payload.userInfo.isKorean == true ? 'kr' : 'en'
    },

    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload
    },

    setAuthorizingFlag: (state, action: PayloadAction<boolean>) => {
      state.isAuthorizing = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string>) => {
      state.authorizationError = action.payload;
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
    dispatch(authSlice.actions.setAuthorizingFlag(true));
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
        authSlice.actions.mountUser({
          token,
          userId: decoded.sub,
          userInfo: user,
        })
      );
      dispatch(updateUserInfo(user));

      await i18next.changeLanguage(user.isKorean === true ? 'kr' : 'en')

      onSuccess?.();
    } catch (err) {
      console.log('Err in login: ', err);
      dispatch(authSlice.actions.setAuthError(err as any));
    } finally {
      dispatch(authSlice.actions.setAuthorizingFlag(false));
    }
  };
}

export function signOut(onSuccess?: () => {}): AppThunk {
  return async (dispatch, getState) => {
    dispatch(authSlice.actions.resetState());
    onSuccess?.();
  };
}

export default persistReducer(
  {
    key: 'root',
    storage,
    whitelist: ['token', 'locale'],
  },
  (state: any, action: PayloadAction<any>) => {
    if(action.type === REHYDRATE){
      const incomingState = action.payload;
      if (incomingState && incomingState.token) {
        const decoded = jwtDecode<{
          sub: string;
          iat: number;
          exp: number;
        }>(incomingState.token);

        if (decoded) {
          // Use the mountUser action to set the state
          return authSlice.reducer(state, authSlice.actions.setUserId(decoded.sub));
        }
      }
    }

    return authSlice.reducer(state, action)
  }
)
