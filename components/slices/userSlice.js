import { createSlice } from "@reduxjs/toolkit"

export const initialState = {
    user: null,
    userUpdatedAt: 0
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        login: function (state, action) {
          state.user = action.payload
          state.userUpdatedAt = Date.now()
        },
        logout: function logout (state /*, action*/) { 
          state.user = null
          state.userUpdatedAt = 0
        }
    }
})

export default sessionSlice.reducer

export const { login, logout } = sessionSlice.actions

export const selectSession = (state) => { return state.session }



/*
import { combineReducers } from 'redux'
const reducers = combineReducers({ 
  count,
})
import {configureStore} from '@reduxjs/toolkit'
import rootReducers from './reducers'

export const initializeStore = () => {
  return configureStore({
    reducer: rootReducers
  })
}




import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, logout, selectSession } from './sessionSlice'

...
const { user } = useSelector(selectSession)
const dispatch = useDispatch()
return <div onClick={() => dispatch(login(user))}>
    { user ? user.nickname || 'Click to login' }
</div>




import { configureStore } from '@reduxjs/toolkit'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(loggerMiddleware),
    preloadedState,
    enhancers: [monitorReducersEnhancer],
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}


*/
