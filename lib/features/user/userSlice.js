'use client'
import { createSlice } from '@reduxjs/toolkit'

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }

  const storedUser = localStorage.getItem('user');
  if (storedUser && storedUser !== 'undefined') {
    try {
      const user = JSON.parse(storedUser);
      return { user, isAuthenticated: true };
    } catch (error) {
      return { user: null, isAuthenticated: false };
    }
  }

  return { user: null, isAuthenticated: false };
}

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('user');
        }
      }
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
