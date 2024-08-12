import { IUserBrowserSessionObj } from "@core";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { Http } from "../../../net/http";
import { AppState, AppThunk } from "../../../redux/store";
import { setOneUser } from "../users/reducer";

const browserSessionEntityAdapter = createEntityAdapter({
    selectId: (model: IUserBrowserSessionObj) => model._id,
    sortComparer: (a, b) => b.startedTimestamp - a.startedTimestamp
})

const initialBrowserSessionEntityState = browserSessionEntityAdapter.getInitialState()

export interface AdminUserState {
    userId?: string
    browserSessionEntityState: typeof initialBrowserSessionEntityState
    activeBrowserSessionId: string | undefined,

    isLoadingSessionList: boolean
}

const INITIAL_STATE: AdminUserState = {
    userId: undefined,
    browserSessionEntityState: initialBrowserSessionEntityState,
    activeBrowserSessionId: undefined,

    isLoadingSessionList: false
}

const adminUserSlice = createSlice({
    name: "ADMIN_USER",
    initialState: INITIAL_STATE,
    reducers: {
        mountSessions: (state, action: PayloadAction<{userId: string, sessions: Array<IUserBrowserSessionObj>}>) => {
            state.userId = action.payload.userId
            browserSessionEntityAdapter.setAll(state.browserSessionEntityState, action.payload.sessions)
        },

        setSessionListLoadingFlag: (state, action: PayloadAction<boolean>) => {
            state.isLoadingSessionList = action.payload
        },


    }
})

export const browserSessionSelectors = browserSessionEntityAdapter.getSelectors((state: AppState) => state.admin.user.browserSessionEntityState)


export function fetchBrowserSessionsOfUser(userId: string): AppThunk {
    return async (dispatch, getState) => {
        const state = getState()

        if(state.admin.auth.token){
            dispatch(adminUserSlice.actions.setSessionListLoadingFlag(true))

            try {
                const resp = await Http.axios.get(`/admin/users/${userId}/browser_sessions/all`, {headers: Http.makeSignedInHeader(state.admin.auth.token)})
                const browserSessions: Array<IUserBrowserSessionObj> = resp.data.browserSessions
                console.log(browserSessions)
                dispatch(adminUserSlice.actions.mountSessions({userId, sessions: browserSessions}))
                dispatch(setOneUser(resp.data))
            }catch(ex){
                console.log(ex)
            }finally{
                dispatch(adminUserSlice.actions.setSessionListLoadingFlag(false))
            }
        }
    }
}

export default adminUserSlice.reducer