import { useMemo } from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

let store

export const actionTypes = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOADING: 'loading'
}

const initialState = { loading: true, user: null }

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

// Action creators
export function login (user) {
    return { type: actionTypes.LOGIN, payload: user }
}

export function loading (bool) {
    return { type: actionTypes.LOADING, payload: !!bool }
}

export const actionCreators = {
    login,
    loading
}

function initStore(preloadedState = initialState) {
    return createStore(
        reducer,
        preloadedState,
        composeWithDevTools(applyMiddleware())
    )
}
    
export const initializeStore = (preloadedState) => {
    let _store = store ?? initStore(preloadedState)
    
    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {
        _store = initStore({
            ...store.getState(),
            ...preloadedState,
        })

        // Reset the current store
        store = undefined
    }
    
    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store

    // Create the store once in the client
    if (!store) store = _store
    
    return _store
}

export function getStore () {
    return store
}

export function useStore(initialState) {
    const store = useMemo(() => initializeStore(initialState), [initialState])
    
    return store
}

