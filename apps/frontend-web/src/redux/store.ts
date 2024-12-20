import {
  configureStore,
  combineReducers,
  Action,
  ThunkAction,
} from '@reduxjs/toolkit';
import agendaReducer from '../features/agenda/reducer';
import authReducer from '../features/auth/reducer';
import userReducer from '../features/user/reducer';
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { adminReducer } from '../admin/reducer';
import i18next from 'i18next';

const rootReducer = combineReducers({
  auth: authReducer,

  user: userReducer,

  agenda: agendaReducer,

  admin: adminReducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store, null, async () => {
  const locale = store.getState().auth.locale
  await i18next.changeLanguage(locale)
});
export default store;

// The following are type hints for redux methods.

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppAction = Action<string>;

export type AppThunk<
  ReturnType = void,
  State = AppState,
  A extends Action = AppAction
> = ThunkAction<ReturnType, State, unknown, A>;
