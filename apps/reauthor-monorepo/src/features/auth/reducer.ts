import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IThreadItem } from '../../Config/interface';
import { IUserBase, IUserWithThreadIds } from '@core';
import { AppThunk } from '../../Redux/store';
import { jwtDecode } from 'jwt-decode';
import { Http } from '../../net/http';
import { updateUserInfo } from '../explore/reducer';

export type IAuthState = {
  isAuthorizing: boolean;
  authorizationError?: string;
  token?: string;
  userId?: string;
}

const initialState: IAuthState = {
  isAuthorizing: false,
  authorizationError: undefined,
  token: undefined,
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
        userInfo: IUserWithThreadIds;
      }>
    ) => {
      state.token = action.payload.token;

      state.userId = action.payload.userId;
      state.authorizationError = undefined;
      console.log('UID SET!: ', state.userId);
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
      dispatch(updateUserInfo({name: user.name, isKorean: user.isKorean}))

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

export default authSlice.reducer;
