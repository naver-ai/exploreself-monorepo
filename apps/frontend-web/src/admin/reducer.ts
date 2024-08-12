
import authReducer from './features/auth/reducer'
import manageReducer from './features/users/reducer'
import userReducer from './features/user/reducer'
import { combineReducers } from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage';

export const adminReducer = combineReducers({
  auth: persistReducer({
    key: 'root',
    storage,
    whitelist: ['token']
  }, authReducer),
  users: manageReducer,
  user: userReducer
})
