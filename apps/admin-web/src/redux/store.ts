
import authReducer from '../features/auth/reducer'
import manageReducer from '../features/manage/reducer'
import { Action, Reducer, Store, ThunkAction, ThunkDispatch, combineReducers, configureStore } from '@reduxjs/toolkit';
import {FLUSH, PAUSE, PERSIST, PURGE, Persistor, REGISTER, REHYDRATE, persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage';

export type AdminCoreState = {
  auth: ReturnType<typeof authReducer>,
  users: ReturnType<typeof manageReducer>
}

export type AdminCoreAction = Action<string>;

export const { store, persistor } = createAdminStore(storage)


type AdditionalReducers = {
  [key:string]: Reducer<any, Action>
}

export type AdminRootState<Additional extends AdditionalReducers = {}> = AdminCoreState & {
  [K in keyof Additional]: ReturnType<Additional[K]>
}

export function createAdminStore<Additional extends AdditionalReducers, A extends Action = AdminCoreAction>(
    persistStorage: any,
    additionalReducers?: Additional,
  ): {store: Store<AdminRootState<Additional>, A> & {dispatch: ThunkDispatch<AdminRootState<Additional>, unknown, A>}, persistor: Persistor} {
  const rootReducer = combineReducers({
    auth: persistReducer({
      key: 'root',
      storage: persistStorage,
      whitelist: ['token']
    }, authReducer),
    users: manageReducer,
    ...additionalReducers
  } as any) as any
  
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
  }) as any

  const persistor = persistStore(store)

  return {store, persistor}
}

export type AdminReduxState = ReturnType<typeof store.getState>
export type AdminDispatch = typeof store.dispatch

export type AdminCoreThunk<ReturnType = void, State = AdminCoreState, A extends Action = AdminCoreAction> = ThunkAction<
  ReturnType,
  State,
  unknown,
  A
>;