import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    otherUsers: null,
    selectedUser: null,
    socket: null,
    onlineUsers: null,
    searchData: null,
    unreadMessages: {}
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    }
    ,
    setSocket: (state, action) => {
      state.socket = action.payload
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload
    },
    setSearchData: (state, action) => {
      state.searchData = action.payload
    },
    setUnreadMessages: (state, action) => {
      state.unreadMessages = action.payload
    },
    incrementUnread: (state, action) => {
      const senderId = action.payload
      state.unreadMessages[senderId] = (state.unreadMessages[senderId] || 0) + 1
    },
    clearUnread: (state, action) => {
      const userId = action.payload
      delete state.unreadMessages[userId]
    }
  }
})

export const { setUserData, setOtherUsers, setSelectedUser, setSocket, setOnlineUsers, setSearchData, setUnreadMessages, incrementUnread, clearUnread } = userSlice.actions
export default userSlice.reducer