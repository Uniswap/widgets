import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'

import multicall from './multicall'
import { routing } from './routing/slice'

const reducer = combineReducers({
  [multicall.reducerPath]: multicall.reducer,
  [routing.reducerPath]: routing.reducer,
})
export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: true }).concat(routing.middleware),
})
