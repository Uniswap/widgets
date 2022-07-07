import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'

import multicall from './multicall'
import { routingApi } from './routing/slice'

const reducer = combineReducers({
  [multicall.reducerPath]: multicall.reducer,
  [routingApi.reducerPath]: routingApi.reducer,
})
export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: true }).concat(routingApi.middleware),
})
