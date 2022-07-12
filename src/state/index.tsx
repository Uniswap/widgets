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
  middleware: (getDefaultMiddleware) =>
    // in routing, we pass in a non-serializable provider object to queryFn to avoid re-instantiating on every query
    // since we don't use time-travel debugging nor persistance, we can ignore the serializable check + store non-serializable items in state
    getDefaultMiddleware({ thunk: true, serializableCheck: false }).concat(routing.middleware),
})
