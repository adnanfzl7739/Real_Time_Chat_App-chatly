import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import getCurrentUser from './customHooks/getCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import Profile from './pages/Profile'
import getOtherUsers from './customHooks/getOtherUsers'
import { io } from "socket.io-client"
import { serverUrl } from './main'
import { setOnlineUsers, setSocket, incrementUnread, setOtherUsers } from './redux/userSlice'
import axios from 'axios'

function App() {
  getCurrentUser()
  getOtherUsers()
  let { userData, socket, onlineUsers, selectedUser } = useSelector(state => state.user)
  let dispatch = useDispatch()

  useEffect(() => {
    if (userData) {
      const socketio = io(`${serverUrl}`, {
        query: {
          userId: userData?._id
        }
      })
      dispatch(setSocket(socketio))

      socketio.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users))
      })

      return () => socketio.close()

    } else {
      if (socket) {
        socket.close()
        dispatch(setSocket(null))
      }
    }


  }, [userData])

  useEffect(() => {
    if (!socket) return

    socket.on("newMessage", (mess) => {
      const senderId = mess.sender
      if (selectedUser?._id !== senderId) {
        dispatch(incrementUnread(senderId))
      }
    })

    return () => socket.off("newMessage")

  }, [socket, selectedUser])

  useEffect(() => {
    if (!socket) return

    socket.on("newConnection", async () => {
      try {
        let result = await axios.get(`${serverUrl}/api/user/others`, { withCredentials: true })
        dispatch(setOtherUsers(result.data))
      } catch (error) {
        console.log(error)
      }
    })

    return () => socket.off("newConnection")

  }, [socket])


  return (
    <Routes>
      <Route path='/login' element={!userData ? <Login /> : <Navigate to="/" />} />
      <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to="/profile" />} />
      <Route path='/' element={userData ? <Home /> : <Navigate to="/login" />} />
      <Route path='/profile' element={userData ? <Profile /> : <Navigate to="/signup" />} />
    </Routes>
  )
}

export default App