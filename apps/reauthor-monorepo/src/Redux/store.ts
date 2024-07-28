import { configureStore, combineReducers, Action, ThunkAction } from "@reduxjs/toolkit";
import exploreReducer from '../features/explore/reducer'
import authReducer from '../features/auth/reducer'
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

const rootReducer = combineReducers({
  auth: persistReducer({
    key: 'root',
    storage,
    whitelist: ['token']
  }, authReducer),

  explore: exploreReducer
})

const store = configureStore({
  reducer: rootReducer,
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