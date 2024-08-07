import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminCoreState, AdminCoreThunk } from '../../redux/store';
import { jwtDecode } from 'jwt-decode';
import { Http } from '../../net/http';
import { IAdminUserWithId, IUserWithThreadIds } from '@core';


const userEntityAdapter = createEntityAdapter<IUserWithThreadIds, string>({
  selectId: (model: IUserWithThreadIds) => model._id
})

const initialUserEntityAdapterState = userEntityAdapter.getInitialState()

export type IManageState = {
  isLoadingUserList: boolean,
  isCreatingUser:  boolean,
  userEntityState: typeof initialUserEntityAdapterState
};

const initialState: IManageState = {
  
  isLoadingUserList: false,
  isCreatingUser: false,
  userEntityState: initialUserEntityAdapterState
};

const manageSlice = createSlice({
  name: 'MANAGE',
  initialState,
  reducers: {
    initialize: () => {
      return { ...initialState };
  },

  _setLoadingUserListFlag: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUserList = action.payload
  },

  _setCreatingUserFlag: (state, action: PayloadAction<boolean>) => {
    state.isCreatingUser = action.payload
  },
  _setLoadedUsers: (state, action: PayloadAction<Array<IUserWithThreadIds>>) => {
    userEntityAdapter.setAll(state.userEntityState, action.payload)
  },
  _appendUser: (state, action: PayloadAction<IUserWithThreadIds>) => {
    userEntityAdapter.addOne(state.userEntityState, action.payload)
  }
  },
});

export const usersSelectors = userEntityAdapter.getSelectors((state: AdminCoreState) => state.users.userEntityState)

export const loadUsers = ():AdminCoreThunk => {
  return async(dispatch, getState) => {
    const state = getState();
    if(state.auth.token != null) {
      dispatch(manageSlice.actions._setLoadingUserListFlag(true))
      try {
        const resp = await Http.axios.get('/admin/manage/users', {
          headers: Http.makeSignedInHeader(state.auth.token)
        })
        const users: IUserWithThreadIds[] = resp.data.userList
        dispatch(manageSlice.actions._setLoadedUsers(users))
      } catch (err) {
        console.log(err)
      } finally {
        dispatch(manageSlice.actions._setLoadingUserListFlag(false))
      }
    }
  }
}

export const createUser = (info: {passcode: string, alias: string}, onCreated: (user: IUserWithThreadIds) => void, onError?: (error: any) => void): AdminCoreThunk => {
  return async(dispatch, getState) => {
    const state = getState();
    if (state.auth.token != null) {
      dispatch(manageSlice.actions._setCreatingUserFlag(true))
      try {
        const resp = await Http.axios.post('/admin/manage/user', {
          userInfo: info
        },{
          headers: Http.makeSignedInHeader(state.auth.token)
        })
        dispatch(manageSlice.actions._appendUser(resp.data.user))
        onCreated(resp.data.user)
      } catch (err) {
        console.log(err)
        // onError(err)
      } finally {
        dispatch(manageSlice.actions._setCreatingUserFlag(false))
      }
    }
  }
}

export default manageSlice.reducer;
