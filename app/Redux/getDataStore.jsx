import { configureStore } from '@reduxjs/toolkit';
import getDataReducer from './getData';

export const getDataStore = configureStore({
  reducer: {
    getDataReducer: getDataReducer,
  },
});
