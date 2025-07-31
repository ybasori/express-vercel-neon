import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from './auth.type'


const initialState:AuthState = { userData: null, }

export const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{username: string}>) => {
      state.userData = action.payload
    },
    logout: (state) => {
      state.userData = null;
    },
  },
})

// Action creators are generated for each case reducer function
export const { login, logout } = auth.actions

export default auth.reducer