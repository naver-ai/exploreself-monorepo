
import authReducer from './features/auth/reducer'
import manageReducer from './features/manage/reducer'
import { Action, Reducer, Store, ThunkAction, ThunkDispatch, combineReducers, configureStore } from '@reduxjs/toolkit';
import {FLUSH, PAUSE, PERSIST, PURGE, Persistor, REGISTER, REHYDRATE, persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage';

export type AdminCoreState = {
  auth: ReturnType<typeof authReducer>,
  users: ReturnType<typeof manageReducer>
}

export const adminReducer = combineReducers({
  auth: persistReducer({
    key: 'root',
    storage,
    whitelist: ['token']
  }, authReducer),
  users: manageReducer})
