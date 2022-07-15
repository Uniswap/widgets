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
    // rtk-query stores original args in state, so we need to turn off serializableCheck
    // this is OK because we don't use time-travel debugging nor persistence
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredPaths: [routing.reducerPath],
      },
    }).concat(routing.middleware),
})
