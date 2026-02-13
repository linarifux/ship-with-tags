import { configureStore } from '@reduxjs/toolkit';
import { shipstationApi } from './apis/shipstationApi';

export const store = configureStore({
  reducer: {
    [shipstationApi.reducerPath]: shipstationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shipstationApi.middleware),
});