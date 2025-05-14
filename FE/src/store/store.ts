import { configureStore } from '@reduxjs/toolkit';
import { codeApi } from './api/codeApi';

export const store = configureStore({
  reducer: {
    [codeApi.reducerPath]: codeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(codeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 