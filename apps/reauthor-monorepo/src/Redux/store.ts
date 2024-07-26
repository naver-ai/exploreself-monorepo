import { configureStore, combineReducers, Action, ThunkAction } from "@reduxjs/toolkit";
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

// The following are type hints for redux methods.

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


export type AppAction = Action<string>;

export type AppThunk<ReturnType = void, State = AppState, A extends Action = AppAction> = ThunkAction<
  ReturnType,
  State,
  unknown,
  A
>;