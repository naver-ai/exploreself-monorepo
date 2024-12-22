import { IAgendaWithThemeIds, IDidTutorial, IUserWithAgendaIds, IUserWithAgendaPopulated } from "@core"
import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppState, AppThunk } from "../../redux/store"
import { Http } from "../../net/http"
import { assertDate } from "../../utils/time"

const agendaEntityAdapter = createEntityAdapter<IAgendaWithThemeIds, string>({
    selectId: (model) => model._id,
    sortComparer: (a, b) => {
        return (assertDate(b.createdAt)?.getTime() || 0) - (assertDate(a.createdAt)?.getTime() || 0)
    }
})

const initialAgendaEntityState = agendaEntityAdapter.getInitialState()

export type IUserState = {
    userId?: string
    isLoadingUserInfo: boolean
    isAgendaListValid: boolean
    isCreatingAgenda: boolean
    agendaListLoadingError: string | undefined,
    agendaEntityState: typeof initialAgendaEntityState,  
}  & Omit<
IUserWithAgendaIds,
'_id' | 'passcode' | 'agendas' | 'alias' | 'isKorean' | 'createdAt' | 'updatedAt'
>;

const INITIAL_STATE : IUserState = {
    userId: undefined,
    isLoadingUserInfo: false,
    isAgendaListValid: true,
    isCreatingAgenda: false,
    agendaListLoadingError: undefined,
    agendaEntityState: initialAgendaEntityState,
    name: undefined,
    didTutorial: {themeBox: false, explore: false},
}

const userSlice = createSlice({
    name: "USER",
    initialState: INITIAL_STATE,
    reducers: {
        initialize: (state, action: PayloadAction<string>) => {
            agendaEntityAdapter.removeAll(state.agendaEntityState)
            state.isAgendaListValid = false
            state.userId = action.payload
        },

        setLoadingUserInfoFlag: (state, action: PayloadAction<boolean>) => {
            state.isLoadingUserInfo = action.payload
        },


        setCreatingAgendaFlag: (state, action: PayloadAction<boolean>) => {
            state.isCreatingAgenda = action.payload
        },
        
        setUserName: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        },

        updateUserInfo: (state, action: PayloadAction<IUserWithAgendaPopulated>) => {
            state.isAgendaListValid = true
            
            console.log("User payload:", action.payload)

            agendaEntityAdapter.setAll(state.agendaEntityState, action.payload.agendas || [])
            state.name= action.payload.name
            state.didTutorial = action.payload.didTutorial
        },



        setDidTutorialFlag: (state, action: PayloadAction<{
            key: keyof IDidTutorial;
            value: boolean;
        }>) => {
            const { key, value } = action.payload;
            state.didTutorial[key] = value;
        },

        appendAgenda: (state, action: PayloadAction<IAgendaWithThemeIds>) => {
            agendaEntityAdapter.addOne(state.agendaEntityState, action.payload)
        }
    }
})

export const agendaSelectors = agendaEntityAdapter.getSelectors((state: AppState) => state.user.agendaEntityState)

export function mountUser(): AppThunk<Promise<string | null>> {
    return async (dispatch, getState) => {
        const state = getState()
        
        const userId = state.auth.userId
        if (state.auth.token != null && userId != null) {
            
            dispatch(userSlice.actions.initialize(userId))
            try {
                const resp = await Http.axios.get('/user', {
                    headers: Http.makeSignedInHeader(state.auth.token),
                });
                const { user } = resp.data;

                dispatch(userSlice.actions.updateUserInfo(user))
                return userId
            }catch (ex) {
                //TODO error handling
                console.error(ex)
                return null
            } finally {
                dispatch(userSlice.actions.setLoadingUserInfoFlag(false))
            }
        }else{
            return null
        }
    }
}


export function updateUserProfile(
    profile: { name: string },
    onSuccess?: () => void
  ): AppThunk {
    return async (dispatch, getState) => {
      const state = getState();
  
      if (state.auth.token) {
        dispatch(userSlice.actions.setLoadingUserInfoFlag(true));
        try {
          const response = await Http.axios.post(`/user/profile`, profile, {
            headers: Http.makeSignedInHeader(state.auth.token),
          });
  
          dispatch(userSlice.actions.updateUserInfo(response.data));
  
          onSuccess?.();
        } catch (err) {
          console.log('Err in setting profile: ', err);
        } finally {
          dispatch(userSlice.actions.setLoadingUserInfoFlag(false));
        }
      }
    };
  }

export function updateDidTutorial(
    tutorialType: keyof IDidTutorial,
    didTutorial: boolean
  ): AppThunk {
    return async (dispatch, getState) => {
      const state = getState();
      if (state.auth.token) {
        try {
          const response = await Http.axios.put(`/user/did_tutorial`,{type: tutorialType, value: didTutorial}, {
            headers: Http.makeSignedInHeader(state.auth.token),
          })
          dispatch(userSlice.actions.setDidTutorialFlag({key: tutorialType, value: didTutorial}));
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

export function createAgenda(
    narrative: string
  ): AppThunk<Promise<string|null>> {
    return async (dispatch, getState) => {
      const state = getState();
  
      if (state.auth.token) {
        dispatch(userSlice.actions.setCreatingAgendaFlag(true));
        try {
          const response = await Http.axios.post(
            '/agendas/new',
            {
              narrative,
            },
            {
              headers: Http.makeSignedInHeader(state.auth.token),
            }
          );

          const newAgenda: IAgendaWithThemeIds = response.data.agenda
  
          dispatch(
            userSlice.actions.appendAgenda(newAgenda)
          );
          return newAgenda._id
        } catch (err) {
          console.log('Err in setting narrative: ', err);
          return null
        } finally {
          dispatch(userSlice.actions.setCreatingAgendaFlag(false));
        }
      }else{
        return null
      }
    };
  }

export const { updateUserInfo } = userSlice.actions

export default userSlice.reducer