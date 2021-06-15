import { createSlice } from "@reduxjs/toolkit"

import { v4 } from "uuid"

export const initialState = {
    items: [] 
}

export const snackSlice = createSlice({
    name: 'snacks',
    initialState,
    reducers: {
        modifySnack: (state, action)=> {
            const snack = state.items.find((snack)=> {
                snack.id === action.payload
            })

            Object.assign(snack, { 
                ...action.payload,
                id: snack.id
            })
        },
        addSnack: (state, action)=> {
            state.items.push({
                date: Date.now(),
                ...action.payload,
                id: action.payload.id || v4()
            })
        },
        removeSnack: (state, action)=> {
            const index = state.items.findIndex((snack)=> 
                snack.id === action.payload
            )

            if (index >= 0) 
                state.items.splice(index, 1)
        }
    }
})

export default snackSlice.reducer

export const { addSnack, removeSnack } = snackSlice.actions

export const selectSnacks = (state) => { return state.snacks.items }