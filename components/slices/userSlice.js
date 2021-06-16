import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
    user: null,
    userUpdatedAt: 0,
    loading: false
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setLoading: function (state, action) {
          state.loading = !!action.payload
        }, 
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

export const { setLoading, login, logout } = sessionSlice.actions

export const selectSession = (state) => { return state.session }