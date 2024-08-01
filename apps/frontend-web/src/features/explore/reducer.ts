import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IQASetWithIds, IThreadWithQuestionIds, IUserAllPopulated, IUserWithThreadIds } from '@core';
import { Http } from '../../net/http';
import { AppState, AppThunk } from '../../redux/store';
import createThreadItem from '../../api_call/createThreadItem';
import { selectQuestionById } from '../../api_call/saveQASet';

const threadEntityAdapter = createEntityAdapter<IThreadWithQuestionIds, string>({
  selectId: (model: IThreadWithQuestionIds) => model._id
})

const questionEntityAdapter = createEntityAdapter<IQASetWithIds, string>({
  selectId: (model) => model._id
})

const initialThreadEntityState = threadEntityAdapter.getInitialState()
const initialQuestionEneityState = questionEntityAdapter.getInitialState()

export type IExploreState = {
  isLoadingUserInfo: boolean;
  isCreatingNewThread: boolean;

  userId?: string;
  pinned_themes: Array<string>; // This should be part of user orm and retrieved from server.

  threadEntityState: typeof initialThreadEntityState,
  questionEntityState: typeof initialQuestionEneityState,

  threadQuestionCreationLoadingFlags: {[key: string] : boolean | undefined}

  isThemeSelectorOpen: boolean;
} & Omit<
  IUserWithThreadIds,
  '_id' | 'passcode' | 'threads' | 'alias' | 'createdAt' | 'updatedAt'
>;

const initialState: IExploreState = {
  isLoadingUserInfo: false,
  isCreatingNewThread: false,

  userId: undefined,
  name: undefined,
  isKorean: true,
  initial_narrative: undefined,
  value_set: [],
  background: undefined,
  pinned_themes: [],

  threadQuestionCreationLoadingFlags : {},

  threadEntityState: initialThreadEntityState,
  questionEntityState: initialQuestionEneityState,

  isThemeSelectorOpen: false,
};

const exploreSlice = createSlice({
  name: 'EXPLORE',
  initialState,
  reducers: {
    updateUserInfo: (
      state,
      action: PayloadAction<Partial<IUserAllPopulated>>
    ) => {
      for (const key of Object.keys(action.payload)) {
        if(key == 'threads'){
          const questions = action.payload.threads?.reduce((prev: Array<IQASetWithIds>, curr) => prev.concat(curr.questions), []) || []
          // Handle threads
          const threadMapped: Array<IThreadWithQuestionIds> = action.payload.threads?.map(thread => ({
            ...thread,
            questions: thread.questions.map(q => q._id)
          })) || []
          threadEntityAdapter.setAll(state.threadEntityState, threadMapped)
          questionEntityAdapter.setAll(state.questionEntityState, questions)

        }else {
          (state as any)[key] = (action.payload as any)[key];
        }
        
      }
      if (action.payload._id != null) {
        state.userId = action.payload._id;
      }
    },

    setThemeSelectorOpen: (state, action: PayloadAction<boolean>) => {
      state.isThemeSelectorOpen = action.payload;
    },

    setLoadingUserInfoFlag: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUserInfo = action.payload;
    },

    setCreatingNewThreadFlag: (state, action: PayloadAction<boolean>) => {
      state.isCreatingNewThread = action.payload;
    },

    setCreatingThreadQuestionsFlag: (state, action: PayloadAction<{tid: string, flag: boolean}>) => {
      state.threadQuestionCreationLoadingFlags[action.payload.tid] = action.payload.flag;
    },

    addPinnedTheme: (state, action) => {
      state.pinned_themes = [...state.pinned_themes, action.payload];
    },
    resetPinnedThemes: (state) => {
      state.pinned_themes = [];
    },
    removePinnedTheme: (state, action) => {
      state.pinned_themes = state.pinned_themes.filter(
        (theme) => theme !== action.payload
      );
    },

    setAllThreads: (state, action: PayloadAction<Array<IThreadWithQuestionIds>>) => {
      threadEntityAdapter.setAll(state.threadEntityState, action.payload)
    },

    updateThread: (state, action: PayloadAction<IThreadWithQuestionIds>) => {
      threadEntityAdapter.upsertOne(state.threadEntityState, action.payload)
    },
    
    appendThread: (state, action: PayloadAction<IThreadWithQuestionIds>) => {
      threadEntityAdapter.addOne(state.threadEntityState, action.payload)
    },

    setQuestions: (state, action: PayloadAction<Array<IQASetWithIds>>) => {
      questionEntityAdapter.setMany(state.questionEntityState, action.payload)
    },

    appendQuestion: (state, action: PayloadAction<IQASetWithIds>) => {
      questionEntityAdapter.addOne(state.questionEntityState, action.payload)
    },

    updateQuestion: (state, action: PayloadAction<IQASetWithIds>) => {
      questionEntityAdapter.upsertOne(state.questionEntityState, action.payload)
    },

    resetState: (state) => initialState,
  },
});

// Entity adapter methods
export const threadSelectors = threadEntityAdapter.getSelectors((state: AppState) => state.explore.threadEntityState)
export const questionSelectors = questionEntityAdapter.getSelectors((state: AppState) => state.explore.questionEntityState)

export const selectedQuestionsSelector = createSelector([questionSelectors.selectAll, (state: AppState, tid: string) => tid], (questions, tid) => {
  return questions.filter(q => q.tid == tid && q.selected == true)
} )


export const selectedQuestionIdsSelector = createSelector([selectedQuestionsSelector], (questions) => {
  return questions.map(q => q._id)
} )

export const unSelectedQuestionsSelector = createSelector([questionSelectors.selectAll, (state: AppState, tid: string) => tid], (questions, tid) => {
  return questions.filter(q => q.tid == tid && q.selected == false)
} )

export const unSelectedQuestionIdsSelector = createSelector([unSelectedQuestionsSelector], (questions) => {
  return questions.map(q => q._id)
} )

// User Info ====================================================================

export function fetchUserInfo(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token) {
      dispatch(exploreSlice.actions.setLoadingUserInfoFlag(true));
      try {
        const resp = await Http.axios.get('/user', {
          headers: Http.makeSignedInHeader(state.auth.token),
        });
        const { user } = resp.data;
        console.log(user);
        dispatch(exploreSlice.actions.updateUserInfo(user));
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(exploreSlice.actions.setLoadingUserInfoFlag(false));
      }
    }
  };
}

export function submitInitialNarrative(
  narrative: string,
  onSuccess?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.auth.token) {
      dispatch(exploreSlice.actions.setLoadingUserInfoFlag(true));
      try {
        const response = await Http.axios.post(
          `/user/narrative`,
          {
            init_narrative: narrative,
          },
          {
            headers: Http.makeSignedInHeader(state.auth.token),
          }
        );

        dispatch(
          exploreSlice.actions.updateUserInfo({
            initial_narrative: response.data.initial_narrative,
          })
        );

        onSuccess?.();
      } catch (err) {
        console.log('Err in setting narrative: ', err);
      } finally {
        dispatch(exploreSlice.actions.setLoadingUserInfoFlag(false));
      }
    }
  };
}

export function submitUserProfile(
  profile: { name: string },
  onSuccess?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.auth.token) {
      dispatch(exploreSlice.actions.setLoadingUserInfoFlag(true));
      try {
        const response = await Http.axios.post(`/user/profile`, profile, {
          headers: Http.makeSignedInHeader(state.auth.token),
        });

        dispatch(exploreSlice.actions.updateUserInfo(response.data));

        onSuccess?.();
      } catch (err) {
        console.log('Err in setting profile: ', err);
      } finally {
        dispatch(exploreSlice.actions.setLoadingUserInfoFlag(false));
      }
    }
  };
}

export function populateNewThread(theme: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.auth.token) {
      dispatch(exploreSlice.actions.setCreatingNewThreadFlag(true))

      try {
        const newThread = await createThreadItem(state.auth.token, theme)
        if(newThread){
          dispatch(exploreSlice.actions.appendThread(newThread))

          dispatch(exploreSlice.actions.setCreatingThreadQuestionsFlag({tid: newThread._id, flag: true}))

          try {
            const response = await Http.axios.post(
              `/thread/${newThread._id}/questions/generate`, null,
              {
                headers: Http.makeSignedInHeader(state.auth.token),
              }
            );
            const { questions } = response.data
            if(questions){
              dispatch(exploreSlice.actions.setQuestions(questions))
            }
          } catch (err) {
            console.log('Err in fetching questions: ', err);
          } finally {
            dispatch(exploreSlice.actions.setCreatingThreadQuestionsFlag({tid: newThread._id, flag: false}))
          }


        }
      }catch( ex) {
        console.log(ex)
      }finally{
        dispatch(exploreSlice.actions.setCreatingNewThreadFlag(false))
      }
    }
  }
}

export function selectQuestion(qid: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState()
    if (state.auth.token) {
      try {
        const updatedQuestion = await selectQuestionById(state.auth.token, qid)
        if(updatedQuestion){
          dispatch(exploreSlice.actions.updateQuestion(updatedQuestion))
        }
      }catch(ex){
        console.log(ex)
      }finally{

      }
    }
  }
}

export const {
  updateUserInfo,
  removePinnedTheme,
  addPinnedTheme,
  resetPinnedThemes,
  resetState,
  setThemeSelectorOpen,
} = exploreSlice.actions;
export default exploreSlice.reducer;
