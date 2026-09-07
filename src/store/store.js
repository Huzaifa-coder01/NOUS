import storage from 'redux-persist/lib/storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { configureStore, createAction } from '@reduxjs/toolkit';
import {
  PAUSE,
  FLUSH,
  PURGE,
  PERSIST,
  REGISTER,
  REHYDRATE,
  persistStore,
  persistReducer,
} from 'redux-persist';

import { authApi } from './Reducer/auth';
import { notesApi } from './Reducer/notes';
import { usersApi } from './Reducer/users';
import { levelsApi } from './Reducer/levels';
import userReducer from './slices/userSlice';
import { coursesApi } from './Reducer/courses';
import { uploadsApi } from './Reducer/uploads';
import { chaptersApi } from './Reducer/chapters';
import { settingsApi } from './Reducer/settings';
import { subjectsApi } from './Reducer/subjects';
import { syllabusApi } from './Reducer/syllabus';
import { dashboardApi } from './Reducer/dashboard';
import { pastPapersApi } from './Reducer/past-papers';

// ----------------------------------------------------------------------

/** Only the signed-in account survives a reload; server state is refetched. */
const persistConfig = { key: 'root', storage, whitelist: ['user'] };

const persistedUserReducer = persistReducer(persistConfig, userReducer);

/** Every RTK Query api registered in the store. */
const apis = [
  authApi,
  coursesApi,
  levelsApi,
  subjectsApi,
  chaptersApi,
  pastPapersApi,
  syllabusApi,
  notesApi,
  uploadsApi,
  usersApi,
  settingsApi,
  dashboardApi,
];

export const resetApiState = createAction('api/resetApiState');

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [levelsApi.reducerPath]: levelsApi.reducer,
    [subjectsApi.reducerPath]: subjectsApi.reducer,
    [chaptersApi.reducerPath]: chaptersApi.reducer,
    [pastPapersApi.reducerPath]: pastPapersApi.reducer,
    [syllabusApi.reducerPath]: syllabusApi.reducer,
    [notesApi.reducerPath]: notesApi.reducer,
    [uploadsApi.reducerPath]: uploadsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // the File an upload carries, and the Request/Response objects RTK
        // Query attaches to its own action metadata - neither is ours to
        // serialise and neither is ever put in the store
        ignoredActionPaths: ['meta.arg.originalArgs', 'meta.baseQueryMeta'],
      },
    }).concat(apis.map((api) => api.middleware)),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

// ----------------------------------------------------------------------

/**
 * Deactivating or deleting a catalog node cascades to every descendant on the
 * server, so one mutation can change rows in several of these apis at once.
 * Tags cannot cross a `createApi` boundary, so this clears the lot - it is the
 * price of a reducer per domain, and it only runs after a cascading write.
 */
export const invalidateCatalog = () => (dispatch) => {
  dispatch(coursesApi.util.invalidateTags(['Courses']));
  dispatch(levelsApi.util.invalidateTags(['Levels']));
  dispatch(subjectsApi.util.invalidateTags(['Subjects']));
  dispatch(chaptersApi.util.invalidateTags(['Chapters']));
  dispatch(pastPapersApi.util.invalidateTags(['PastPapers']));
  dispatch(syllabusApi.util.invalidateTags(['Syllabus']));
  dispatch(notesApi.util.invalidateTags(['Notes']));
};

/** Drops every cached response - used when a session ends. */
export const resetAllApiState = () => (dispatch) => {
  apis.forEach((api) => dispatch(api.util.resetApiState()));
};
