import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

export const actionTypes = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOADING: 'loading'
}

export function reducer (state, action = {}) {
    let next = state

    switch (action.type) {
        case actionTypes.LOGIN:
            next = { 
                ...state, 
                user: action.payload, 
                userUpdatedAt: (action.payload === state.user && state.userUpdatedAt) || Date.now() 
            }
        break

        case actionTypes.LOADING: 
            next = { ...state, loading: false }
        break
    }

    return next
}

export function login (user) {
    return { type: actionTypes.LOGIN, payload: user }
}

export function loading (bool) {
    return { type: actionTypes.LOADING, payload: !!bool }
}

export function initializeStore (initialState = {}) {
    return createStore(
      reducer,
      initialState,
      composeWithDevTools(applyMiddleware())
    )
}