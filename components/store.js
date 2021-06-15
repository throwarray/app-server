import { useMemo } from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import { combineReducers } from 'redux'

import userSlice from './slices/userSlice'

import snackSlice from './slices/snackSlice'

const reducers = combineReducers({
    session: userSlice,
    snacks: snackSlice
})



let store

export const actionTypes = {
    LOADING: 'LOADING',
    LOADING_PAGE: 'LOADING_PAGE'
}

const initialState = {}

// TODO FIX LOADING STATUS

// export function reducer (state, action = {}) {
//     let next = state
    
//     switch (action.type) {
//         case actionTypes.LOGIN:
//             next = { 
//                 ...state, 
//                 user: action.payload, 
//                 userUpdatedAt: (action.payload === state.user && state.userUpdatedAt) || Date.now() 
//             }
//         break
        
//         case actionTypes.LOADING:
//             if (action.meta && action.meta.id) {
//                 // Insert a loading state
//                 if (action.payload) {
//                     next = { 
//                         ...state,
//                         loading: [
//                             ...(state.loading || []), 
//                             { ...action.meta }
//                         ]
//                     }
//                 }

//                 // Remove a loading state
//                 else {
//                     next = { 
//                         ...state,
//                         loading: (state.loading || []).filter(function (item) {
//                             return item.id !== action.meta.id
//                         })
//                     }
//                 }
//             }
//         break

//         case actionTypes.LOADING_PAGE: 
//             next = { ...state, loadingPage: action.payload || false }
//         break
//     }
    
//     return next
// }

// Action creators
export function ACTION_LOADING (bool, meta) {
    return { type: actionTypes.LOADING, payload: !!bool, meta }
}

export function ACTION_LOADING_PAGE (bool) {
    return { type: actionTypes.LOADING_PAGE, payload: !!bool }
}

function initStore(preloadedState = initialState) {
    return createStore(
        reducers,
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

// export function getStore () {
//     return store
// }

export function useStore(initialState) {
    const store = useMemo(() => initializeStore(initialState), [initialState])
    
    return store
}
