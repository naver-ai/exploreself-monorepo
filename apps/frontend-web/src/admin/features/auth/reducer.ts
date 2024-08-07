import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserWithThreadIds } from '@core';
import { jwtDecode } from 'jwt-decode';
import { Http } from '../../../net/http';
import { AppThunk } from '../../../redux/store';

export type IAdminAuthState = {
  isAuthorizing: boolean;
  token?: string;
  error?: string;
};

const initialState: IAdminAuthState = {
  isAuthorizing: false,
  token: undefined,
  error: undefined,
};

const authSlice = createSlice({
  name: 'ADMIN_AUTH',
  initialState,
  reducers: {
    initialize: () => {
      return { ...initialState };
  },

  _authorizingFlagOn: (state) => {
      state.isAuthorizing = true;
      state.token = undefined;
  },

  _authorizingFlagOff: (state) => {
      state.isAuthorizing = false;
  },

  _setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
  },

  _setSignedInUser: (state, action: PayloadAction<{ token: string }>) => {
      state.isAuthorizing = false;
      state.token = action.payload.token;
      state.error = undefined;
  },
  },
});



export function loginAdminThunk(password: string, onSuccess?: ()=>void): AppThunk {
  return async (dispatch, getState) => {
      dispatch(authSlice.actions._authorizingFlagOn());

      try {
          const tokenResponse = await Http.axios.post('/admin/auth/login', { password });
          console.log("token resp: ", tokenResponse)

          const { token } = tokenResponse.data

          const decoded = jwtDecode<{
              sub: string,
              iat: number,
              exp: number
          }>(token)

          console.log("Signed in with admin id", decoded.sub)

          dispatch(authSlice.actions._setSignedInUser({
              token: token
          }))
          onSuccess?.()

      } catch (ex) {
          console.log(ex)
          // TODO: Set error
          // dispatch(authSlice.actions._setError(error))
      } finally {
          dispatch(authSlice.actions._authorizingFlagOff())
      }
  };
}

export function signOutAdminThunk(): AppThunk {
  return async (dispatch, getState) => {
      dispatch(authSlice.actions.initialize())
  }
}

export default authSlice.reducer;
