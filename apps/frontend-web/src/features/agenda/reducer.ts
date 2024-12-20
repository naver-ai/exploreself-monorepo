import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  IAgendaAllPopulated,
  IAgendaWithThemeIds,
  InteractionBase,
  InteractionType,
  IQASetWithIds,
  IThreadWithQuestionIds,
  IUserAllPopulated,
  IUserWithAgendaIds,
  SessionStatus,
  ThemeWithExpressions,
} from '@core';
import { Http } from '../../net/http';
import { AppState, AppThunk } from '../../redux/store';
import createThreadItem from '../../api_call/createThreadItem';
import { selectQuestionById, updateResponse } from '../../api_call/saveQASet';
import generateQuestions from '../../api_call/generateQuestions';
import generateComment from '../../api_call/generateComment';
import generateKeywords from '../../api_call/generateKeywords';
import { postInteractionData } from '../../api_call/postInteractionData';
import { generateSummary } from '../../api_call/generateSummary';
import getThemeRecommendation from '../../api_call/generateThemes';

const threadEntityAdapter = createEntityAdapter<IThreadWithQuestionIds, string>(
  {
    selectId: (model: IThreadWithQuestionIds) => model._id,
  }
);

const questionEntityAdapter = createEntityAdapter<IQASetWithIds, string>({
  selectId: (model) => model._id,
});

const initialThreadEntityState = threadEntityAdapter.getInitialState();
const initialQuestionEneityState = questionEntityAdapter.getInitialState();

export type IAgendaState = {
  isLoadingAgenda: boolean;
  isCreatingNewThread: boolean;
  isCreatingSummary: boolean;
  isLoadingThemes: boolean;
  newThemes: ThemeWithExpressions[];

  agendaId?: string

  title?: string 

  threadEntityState: typeof initialThreadEntityState;
  questionEntityState: typeof initialQuestionEneityState;

  threadInInitializationFlags: { [key: string]: boolean | undefined };
  threadQuestionCreationLoadingFlags: { [key: string]: boolean | undefined };
  questionCommentCreationLoadingFlags: { [key: string]: boolean | undefined };
  questionKeywordCreationLoadingFlags: { [key: string]: boolean | undefined };
  questionShowKeywordsFlags: { [key: string]: boolean | undefined };

  isThemeSelectorOpen: boolean;

  recentlyActiveQuestionId: string | undefined;

  reservedFloatingHeaders: { [key: string]: boolean };

  hoveringOutlineThreadId?: string | undefined;

  recentRemovedTheme?: string | undefined;
} & Omit<
  IAgendaWithThemeIds,
  '_id' | 'threads' | 'title' | 'createdAt' | 'updatedAt'
>;

const initialState: IAgendaState = {
  isLoadingAgenda: false,
  isCreatingNewThread: false,
  isCreatingSummary: false,
  isLoadingThemes: false,
  newThemes: [],

  agendaId: undefined,

  title:undefined,

  initialNarrative: '',
  debriefing: undefined,
  pinnedThemes: [],
  recentRemovedTheme: undefined,
  sessionStatus: SessionStatus.Exploring,

  summaries: [],

  threadInInitializationFlags: {},
  threadQuestionCreationLoadingFlags: {},
  questionCommentCreationLoadingFlags: {},
  questionKeywordCreationLoadingFlags: {},
  questionShowKeywordsFlags: {},

  threadEntityState: initialThreadEntityState,
  questionEntityState: initialQuestionEneityState,

  hoveringOutlineThreadId: undefined,

  isThemeSelectorOpen: false,

  recentlyActiveQuestionId: undefined,

  reservedFloatingHeaders: {},
};

const agendaSlice = createSlice({
  name: 'AGENDA',
  initialState,
  reducers: {
    updateAgendaInfo: (
      state,
      action: PayloadAction<Partial<IAgendaAllPopulated>>
    ) => {
      for (const key of Object.keys(action.payload)) {
        if (key == 'threads') {
          const questions =
            action.payload.threads?.reduce(
              (prev: Array<IQASetWithIds>, curr) => prev.concat(curr.questions),
              []
            ) || [];
          // Handle threads
          const threadMapped: Array<IThreadWithQuestionIds> =
            action.payload.threads?.map((thread) => ({
              ...thread,
              questions: thread.questions.map((q) => q._id),
            })) || [];
          threadEntityAdapter.setAll(state.threadEntityState, threadMapped);
          questionEntityAdapter.setAll(state.questionEntityState, questions);
        } else {
          (state as any)[key] = (action.payload as any)[key];
        }
      }
      if (action.payload._id != null) {
        state.agendaId = action.payload._id;
      }
    },

    setThemeSelectorOpen: (state, action: PayloadAction<boolean>) => {
      state.isThemeSelectorOpen = action.payload;
    },

    setHoveringOutlineThreadId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.hoveringOutlineThreadId = action.payload;
    },

    setFloatingHeaderFlag: (
      state,
      action: PayloadAction<{ tid: string; intersecting: boolean }>
    ) => {
      state.reservedFloatingHeaders[action.payload.tid] =
        action.payload.intersecting;
    },

    setLoadingAgendaFlag: (state, action: PayloadAction<boolean>) => {
      state.isLoadingAgenda = action.payload;
    },

    setCreatingNewThreadFlag: (state, action: PayloadAction<boolean>) => {
      state.isCreatingNewThread = action.payload;
    },

    setCreatingSummaryFlag: (state, action: PayloadAction<boolean>) => {
      state.isCreatingSummary = action.payload;
    },

    setLoadingThemesFlag: (state, action: PayloadAction<boolean>) => {
      state.isLoadingThemes = action.payload;
    },

    setRecentlyActiveQuestionId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.recentlyActiveQuestionId = action.payload;
    },

    setInitializingThreadFlag: (
      state,
      action: PayloadAction<{ tid: string; flag: boolean }>
    ) => {
      state.threadInInitializationFlags[action.payload.tid] =
        action.payload.flag;
    },

    setCreatingThreadQuestionsFlag: (
      state,
      action: PayloadAction<{ tid: string; flag: boolean }>
    ) => {
      state.threadQuestionCreationLoadingFlags[action.payload.tid] =
        action.payload.flag;
    },

    setAllThreads: (
      state,
      action: PayloadAction<Array<IThreadWithQuestionIds>>
    ) => {
      threadEntityAdapter.setAll(state.threadEntityState, action.payload);
    },

    updateThread: (state, action: PayloadAction<IThreadWithQuestionIds>) => {
      threadEntityAdapter.upsertOne(state.threadEntityState, action.payload);
    },

    appendThread: (state, action: PayloadAction<IThreadWithQuestionIds>) => {
      threadEntityAdapter.addOne(state.threadEntityState, action.payload);
    },

    setQuestions: (state, action: PayloadAction<Array<IQASetWithIds>>) => {
      questionEntityAdapter.setMany(state.questionEntityState, action.payload);
    },

    appendQuestion: (state, action: PayloadAction<IQASetWithIds>) => {
      questionEntityAdapter.addOne(state.questionEntityState, action.payload);
    },

    appendQuestions: (state, action: PayloadAction<IQASetWithIds[]>) => {
      questionEntityAdapter.addMany(state.questionEntityState, action.payload);
    },

    updateQuestion: (
      state,
      action: PayloadAction<Partial<IQASetWithIds> & { _id: string }>
    ) => {
      const questionObj =
        state.questionEntityState.entities[action.payload._id];
      if (questionObj) {
        questionEntityAdapter.upsertOne(state.questionEntityState, {
          ...questionObj,
          ...action.payload,
        });
      }
    },

    updateQuestionWithNewComment: (
      state,
      action: PayloadAction<{ qid: string; comment: string }>
    ) => {
      const { qid, comment } = action.payload;
      const questionObj = state.questionEntityState.entities[qid];

      if (questionObj) {
        const updatedAiGuides = [
          ...(questionObj.aiGuides || []),
          { content: comment },
        ];

        questionEntityAdapter.upsertOne(state.questionEntityState, {
          ...questionObj,
          aiGuides: updatedAiGuides,
        });
      } else {
        console.log('Not found');
      }
    },

    updateQuestionWithNewKeywords: (
      state,
      action: PayloadAction<{ qid: string; keywords: Array<string> }>
    ) => {
      const questionObj =
        state.questionEntityState.entities[action.payload.qid];
      if (questionObj) {
        if (!questionObj.keywords) {
          questionObj.aiGuides = [];
        }
        questionObj.keywords.push(...action.payload.keywords);
      }
    },

    updateQuestionResponse: (
      state,
      action: PayloadAction<{ qid: string; response: string }>
    ) => {
      const { qid, response } = action.payload;
      const questionObj = state.questionEntityState.entities[qid];
      if (questionObj) {
        questionEntityAdapter.upsertOne(state.questionEntityState, {
          ...questionObj,
          response: response,
        });
      } else {
        console.log('Not found');
      }
    },

    setCreatingQuestionCommentFlag: (
      state,
      action: PayloadAction<{ qid: string; flag: boolean }>
    ) => {
      state.questionCommentCreationLoadingFlags[action.payload.qid] =
        action.payload.flag;
    },

    setCreatingQuestionKeywordsFlag: (
      state,
      action: PayloadAction<{ qid: string; flag: boolean }>
    ) => {
      state.questionKeywordCreationLoadingFlags[action.payload.qid] =
        action.payload.flag;
    },

    setQuestionShowKeywordsFlag: (
      state,
      action: PayloadAction<{ qid: string; flag: boolean }>
    ) => {
      state.questionShowKeywordsFlags[action.payload.qid] = action.payload.flag;
    },

    addNewSummary: (state, action: PayloadAction<string>) => {
      state.summaries.push(action.payload);
    },

    appendPinnedTheme: (state, action: PayloadAction<string>) => {
      if (state.pinnedThemes.indexOf(action.payload) == -1) {
        state.pinnedThemes.push(action.payload);

        state.recentRemovedTheme = undefined;
      }
    },

    removePinnedTheme: (
      state,
      action: PayloadAction<{ theme: string; undoable: boolean }>
    ) => {
      const index = state.pinnedThemes.indexOf(action.payload.theme);
      if (index >= 0) {
        state.pinnedThemes.splice(index, 1);
      }
      if (action.payload.undoable) {
        state.recentRemovedTheme = action.payload.theme;
      } else {
        state.recentRemovedTheme = undefined;
      }
    },
    addNewThemes: (
      state,
      action: PayloadAction<Array<ThemeWithExpressions>>
    ) => {
      state.newThemes.push(...action.payload);
    },
    resetNewThemes: (state) => {
      state.newThemes = [];
    },
    resetState: (state) => initialState,
  },
});

// Entity adapter methods
export const threadSelectors = threadEntityAdapter.getSelectors(
  (state: AppState) => state.agenda.threadEntityState
);
export const questionSelectors = questionEntityAdapter.getSelectors(
  (state: AppState) => state.agenda.questionEntityState
);

export const selectedQuestionsSelector = createSelector(
  [questionSelectors.selectAll, (state: AppState, tid: string) => tid],
  (questions, tid) => {
    return questions.filter((q) => q.tid == tid && q.selected == true);
  }
);

export const selectedQuestionIdsSelector = createSelector(
  [selectedQuestionsSelector],
  (questions) => {
    {
      return questions
        .slice()
        .sort((a, b) => {
          if (!a.selectedAt) return 1;
          if (!b.selectedAt) return -1;
          return (
            new Date(a.selectedAt).getTime() - new Date(b.selectedAt).getTime()
          );
        })
        .map((q) => q._id);
    }
  }
);

export const unSelectedQuestionsSelector = createSelector(
  [questionSelectors.selectAll, (state: AppState, tid: string) => tid],
  (questions, tid) => {
    return questions.filter((q) => q.tid == tid && q.selected == false);
  }
);

export const unSelectedQuestionIdsSelector = createSelector(
  [unSelectedQuestionsSelector],
  (questions) => {
    return questions.map((q) => q._id);
  }
);

export const selectFloatingHeader = createSelector(
  [
    (state: AppState) => state.agenda.reservedFloatingHeaders,
    threadSelectors.selectAll,
  ],
  (headerFlags, threads) => {
    const tid = Object.keys(headerFlags).find(
      (tid) => headerFlags[tid] === true
    );
    if (tid != null) {
      const thread = threads.find((t) => t._id == tid);
      return thread?.theme;
    } else {
      return undefined;
    }
  }
);

export function loadAgenda(id: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token) {
      dispatch(agendaSlice.actions.setLoadingAgendaFlag(true));
      try {
        const response = await Http.axios.get(`/agendas/${id}`, {
          headers: Http.makeSignedInHeader(state.auth.token),
        });

        const agenda: IAgendaAllPopulated = response.data.agenda

        dispatch(agendaSlice.actions.updateAgendaInfo(agenda))

      } catch (ex) {
        console.error(ex);
      } finally {
        dispatch(agendaSlice.actions.setLoadingAgendaFlag(false));
      }
    }
  };
}

export function terminateSession(
  debriefing?: string | null,
  onSuccess?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        const response = await Http.axios.post(
          `/agendas/${state.agenda.agendaId}/terminate`,
          {
            debriefing:
              debriefing != null && debriefing == '' ? null : debriefing,
          },
          {
            headers: Http.makeSignedInHeader(state.auth.token),
          }
        );

        dispatch(agendaSlice.actions.updateAgendaInfo(response.data));

        onSuccess?.();
      } catch (err) {
      } finally {
      }
    }
  };
}

export function revertTerminateSession(onSuccess?: () => void): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        const response = await Http.axios.post(
          `/agendas/${state.agenda.agendaId}/revert_terminate`,
          {},
          {
            headers: Http.makeSignedInHeader(state.auth.token),
          }
        );

        dispatch(agendaSlice.actions.updateAgendaInfo(response.data));

        onSuccess?.();
      } catch (err) {
      } finally {
      }
    }
  };
}

export function enterReviewStage(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        const response = await Http.axios.put(
          `/agendas/${state.agenda.agendaId}/status`,
          { status: SessionStatus.Reviewing },
          { headers: Http.makeSignedInHeader(state.auth.token) }
        );

        dispatch(agendaSlice.actions.updateAgendaInfo(response.data));
      } catch (ex) {
        console.log(ex);
      } finally {
      }
    }
  };
}

export function abortReviewStage(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token) {
      try {
        const response = await Http.axios.put(
          `/agendas/${state.agenda.agendaId}/status`,
          { status: SessionStatus.Exploring },
          { headers: Http.makeSignedInHeader(state.auth.token) }
        );

        dispatch(agendaSlice.actions.updateAgendaInfo(response.data));
      } catch (ex) {
        console.log(ex);
      } finally {
      }
    }
  };
}

export function populateNewThread(
  theme: string,
  handlers?: {
    onThreadCreated?: (tid: string) => void;
    onQuestionsGenerated?: (tid: string) => void;
  }
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();

    if (state.auth.token && state.agenda.agendaId) {
      dispatch(agendaSlice.actions.setCreatingNewThreadFlag(true));

      try {
        const newThread = await createThreadItem(
          state.auth.token,
          state.agenda.agendaId,
          theme
        );
        if (newThread) {
          dispatch(agendaSlice.actions.appendThread(newThread));
          dispatch(
            agendaSlice.actions.setInitializingThreadFlag({
              tid: newThread._id,
              flag: true,
            })
          );
          dispatch(
            agendaSlice.actions.setCreatingThreadQuestionsFlag({
              tid: newThread._id,
              flag: true,
            })
          );
          handlers?.onThreadCreated?.(newThread._id);

          try {
            const questions = await generateQuestions(
              state.auth.token,
              state.agenda.agendaId,
              newThread._id,
              3
            );
            if (questions) {
              dispatch(agendaSlice.actions.setQuestions(questions));
              handlers?.onQuestionsGenerated?.(newThread._id);
            }
          } catch (err) {
            console.log('Err in fetching questions: ', err);
          } finally {
            dispatch(
              agendaSlice.actions.setCreatingThreadQuestionsFlag({
                tid: newThread._id,
                flag: false,
              })
            );
            dispatch(
              agendaSlice.actions.setInitializingThreadFlag({
                tid: newThread._id,
                flag: false,
              })
            );
          }
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(agendaSlice.actions.setCreatingNewThreadFlag(false));
      }
    }
  };
}

export function selectQuestion(
  tid: string,
  qid: string,
  onComplete?: (updatedQuestion: IQASetWithIds) => void
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        const updatedQuestion = await selectQuestionById(state.auth.token, state.agenda.agendaId, tid, qid);
        if (updatedQuestion) {
          dispatch(agendaSlice.actions.updateQuestion(updatedQuestion));
          await postInteractionData(
            state.auth.token,
            InteractionType.UserSelectsQuestion,
            { selected_question: updatedQuestion },
            {}
          );
          onComplete?.(updatedQuestion);
        }
      } catch (ex) {
        console.log(ex);
      } finally {
      }
    }
  };
}

export function getMoreQuestion(tid: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(
          agendaSlice.actions.setCreatingThreadQuestionsFlag({
            tid: tid,
            flag: true,
          })
        );
        const fetchedQuestion = await generateQuestions(
          state.auth.token,
          state.agenda.agendaId,
          tid,
          3
        );
        if (fetchedQuestion) {
          dispatch(agendaSlice.actions.appendQuestions(fetchedQuestion));
          await postInteractionData(
            state.auth.token,
            InteractionType.UserRequestsQuestion,
            { generated_questions: fetchedQuestion },
            { tid: tid }
          );
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(
          agendaSlice.actions.setCreatingThreadQuestionsFlag({
            tid: tid,
            flag: false,
          })
        );
      }
    }
  };
}

export function getNewQuestions(
  tid: string,
  opt: number = 3,
  prevQ: Array<string> = []
): AppThunk<Promise<IQASetWithIds[] | undefined>> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(
          agendaSlice.actions.setCreatingThreadQuestionsFlag({
            tid: tid,
            flag: true,
          })
        );
        const fetchedQuestion = await generateQuestions(
          state.auth.token,
          state.agenda.agendaId,
          tid,
          opt,
          prevQ
        );
        if (fetchedQuestion) {
          dispatch(agendaSlice.actions.appendQuestions(fetchedQuestion));
          await postInteractionData(
            state.auth.token,
            InteractionType.UserRequestsQuestion,
            { generated_questions: fetchedQuestion },
            { tid: tid }
          );
        }

        return fetchedQuestion;
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(
          agendaSlice.actions.setCreatingThreadQuestionsFlag({
            tid: tid,
            flag: false,
          })
        );
      }
    }
  };
}

export function getNewComment(
  tid: string,
  qid: string,
  userResponse: string
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(
          agendaSlice.actions.setCreatingQuestionCommentFlag({
            qid: qid,
            flag: true,
          })
        );
        const newComment = await generateComment(
          state.auth.token,
          state.agenda.agendaId,
          tid,
          qid,
          userResponse
        );
        if (newComment) {
          dispatch(
            agendaSlice.actions.updateQuestionWithNewComment({
              qid: qid,
              comment: newComment.comment,
            })
          );
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(
          agendaSlice.actions.setCreatingQuestionCommentFlag({
            qid: qid,
            flag: false,
          })
        );
      }
    }
  };
}

export function getNewKeywords(
  tid: string,
  qid: string,
  opt: number = 1
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(
          agendaSlice.actions.setCreatingQuestionKeywordsFlag({
            qid: qid,
            flag: true,
          })
        );
        const newKeywords = await generateKeywords(
          state.auth.token,
          state.agenda.agendaId,
          tid,
          qid,
          opt
        );
        if (newKeywords) {
          dispatch(
            agendaSlice.actions.updateQuestionWithNewKeywords({
              qid: qid,
              keywords: newKeywords,
            })
          );
          await postInteractionData(
            state.auth.token,
            InteractionType.LLMGeneratedKeyword,
            { keywords: newKeywords },
            { qid: qid }
          );
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(
          agendaSlice.actions.setCreatingQuestionKeywordsFlag({
            qid: qid,
            flag: false,
          })
        );
      }
    }
  };
}

export function getNewSummary(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(agendaSlice.actions.setCreatingSummaryFlag(true));
        const summaryMappings = await generateSummary(
          state.auth.token,
          state.agenda.agendaId
        );
        if (summaryMappings != null) {
          const combinedSummary = summaryMappings
            .map((item: any) => item.sentence)
            .join(' ');
          dispatch(agendaSlice.actions.addNewSummary(combinedSummary));
        } else {
          //TODO error handling
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(agendaSlice.actions.setCreatingSummaryFlag(false));
      }
    }
  };
}

export function updateQuestionResponse(
  tid: string, 
  qid: string,
  response: string,
  interaction_data: InteractionBase
): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(
          agendaSlice.actions.updateQuestionResponse({
            qid: qid,
            response: response,
          })
        );
        const updatedQuestion = await updateResponse(
          state.auth.token,
          state.agenda.agendaId, tid,
          qid,
          response,
          interaction_data
        );
      } catch (ex) {
        console.log(ex);
      } finally {
      }
    }
  };
}
export function pinTheme(theme: string): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token) {
      try {
        dispatch(agendaSlice.actions.appendPinnedTheme(theme));
        const resp = await Http.axios.post(
          `/agendas/${state.agenda.agendaId}/pin`,
          {
            theme,
          },
          {
            headers: Http.makeSignedInHeader(state.auth.token),
          }
        );

        dispatch(agendaSlice.actions.updateAgendaInfo(resp.data));
        resp.data;
      } catch (ex) {
        console.log(ex);
        dispatch(
          agendaSlice.actions.removePinnedTheme({ theme, undoable: false })
        );
      } finally {
      }
    }
  };
}

export function unpinTheme(theme: string, intentional: boolean): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(
          agendaSlice.actions.removePinnedTheme({
            theme,
            undoable: intentional,
          })
        );
        const resp = await Http.axios.post(
          `/agendas/${state.agenda.agendaId}/unpin`,
          {
            theme,
          },
          {
            headers: Http.makeSignedInHeader(state.auth.token),
          }
        );

        dispatch(agendaSlice.actions.updateAgendaInfo(resp.data));
        resp.data;
      } catch (ex) {
        console.log(ex);
        dispatch(agendaSlice.actions.appendPinnedTheme(theme));
      } finally {
      }
    }
  };
}

export function getNewThemes(opt: number): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token && state.agenda.agendaId) {
      try {
        dispatch(agendaSlice.actions.setLoadingThemesFlag(true));
        const prevThemes = state.agenda.newThemes.map(
          (theme) => theme.main_theme
        );
        const themes = await getThemeRecommendation(
          state.auth.token,
          state.agenda.agendaId,
          prevThemes,
          opt
        );
        dispatch(agendaSlice.actions.addNewThemes(themes));
        await postInteractionData(
          state.auth.token,
          opt == 1
            ? InteractionType.UserRequestsTheme
            : InteractionType.LLMElicitedTheme,
          { themes: themes.map((theme: any) => theme.main_theme) },
          {}
        );
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(agendaSlice.actions.setLoadingThemesFlag(false));
      }
    }
  };
}

export function dangerousReset(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.auth.token != null) {
      dispatch(agendaSlice.actions.setLoadingAgendaFlag(true));
      try {
        const resp = await Http.axios.delete('/user/reset', {
          headers: Http.makeSignedInHeader(state.auth.token),
        });

        const { updatedUser } = resp.data;
        dispatch(agendaSlice.actions.updateAgendaInfo(updatedUser));
      } catch (ex) {
        console.log(ex);
      } finally {
        dispatch(agendaSlice.actions.setLoadingAgendaFlag(false));
      }
    }
  };
}

export const {
  resetState,
  setThemeSelectorOpen,
  setFloatingHeaderFlag,
  setRecentlyActiveQuestionId,
  updateQuestion,
  setQuestionShowKeywordsFlag,
  setLoadingThemesFlag,
  resetNewThemes,
  setHoveringOutlineThreadId,
} = agendaSlice.actions;
export default agendaSlice.reducer;
