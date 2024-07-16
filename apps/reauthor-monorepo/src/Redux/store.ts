import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer, { IUserState } from './reducers/userSlice'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: 'root',
  storage
}
export interface IRootState {
  userInfo: IUserState
}
const rootReducer = combineReducers({
  userInfo: userReducer
})
const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      }
    })
})

export const peresistor = persistStore(store);
export default store;