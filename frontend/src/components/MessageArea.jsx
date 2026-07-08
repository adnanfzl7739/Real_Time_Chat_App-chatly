import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import dp from "../assets/dp.webp"
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice';
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import EmojiPicker from 'emoji-picker-react';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../main';
import { setMessages } from '../redux/messageSlice';
import { RxCross2 } from "react-icons/rx";

function MessageArea() {
  let { selectedUser, userData, socket, onlineUsers } = useSelector(state => state.user)
  let dispatch = useDispatch()
  let [showPicker, setShowPicker] = useState(false)
  let [input, setInput] = useState("")
  let [frontendImage, setFrontendImage] = useState(null)
  let [backendImage, setBackendImage] = useState(null)
  let [isTyping, setIsTyping] = useState(false)
  let image = useRef()
  let typingTimeout = useRef()
  let messagesEndRef = useRef()
  let { messages } = useSelector(state => state.message)

  const handleImage = (e) => {
    let file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.length == 0 && backendImage == null) {
      return
    }
    try {
      let formData = new FormData()
      formData.append("message", input)
      if (backendImage) {
        formData.append("image", backendImage)
      }
      let result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`, formData, { withCredentials: true })
      dispatch(setMessages([...messages, result.data]))
      setInput("")
      setFrontendImage(null)
      setBackendImage(null)
    } catch (error) {
      console.log(error)
    }
  }

  const onEmojiClick = (emojiData) => {
    setInput(prevInput => prevInput + emojiData.emoji)
    setShowPicker(false)
  }

  // Listen for new incoming messages
  useEffect(() => {
    socket?.on("newMessage", (mess) => {
      dispatch(setMessages([...messages, mess]))
      setIsTyping(false)
    })
    return () => socket?.off("newMessage")
  }, [messages, setMessages])

  // Listen for typing / stopTyping events from the selected user
  useEffect(() => {
    socket?.on("typing", (senderId) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(true)
      }
    })

    socket?.on("stopTyping", (senderId) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(false)
      }
    })

    return () => {
      socket?.off("typing")
      socket?.off("stopTyping")
    }
  }, [socket, selectedUser])

  // Reset typing indicator whenever chat is switched
  useEffect(() => {
    setIsTyping(false)
  }, [selectedUser])

  // Emit typing / stopTyping based on input changes
  useEffect(() => {
    if (!selectedUser) return

    if (input.length > 0) {
      socket?.emit("typing", selectedUser._id)

      clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        socket?.emit("stopTyping", selectedUser._id)
      }, 1500)
    } else {
      socket?.emit("stopTyping", selectedUser._id)
    }

    return () => clearTimeout(typingTimeout.current)
  }, [input])

  // Auto-scroll to the latest message / typing indicator
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, selectedUser])

  return (
    <div className={`lg:w-[70%] relative ${selectedUser ? "flex" : "hidden"} lg:flex w-full h-full bg-slate-50 overflow-hidden`}>

      {selectedUser &&
        <div className='w-full h-[100vh] flex flex-col overflow-hidden items-center'>

          {/* Chat header */}
          <div className='w-full h-[72px] bg-white border-b border-slate-200 flex items-center px-4 gap-3 shadow-sm z-10'>
            <div className='cursor-pointer text-slate-500 hover:text-slate-700 transition-colors lg:hidden' onClick={() => dispatch(setSelectedUser(null))}>
              <IoIosArrowRoundBack className='w-[32px] h-[32px]' />
            </div>
            <div className='relative w-[44px] h-[44px] rounded-full overflow-hidden ring-1 ring-slate-200 flex-shrink-0'>
              <img src={selectedUser?.image || dp} alt="" className='w-full h-full object-cover' />
            </div>
            <div className='flex flex-col'>
              <h1 className='text-slate-800 font-semibold text-[16px] leading-tight'>{selectedUser?.name || "user"}</h1>
              <span className={`text-[12px] ${onlineUsers?.includes(selectedUser?._id) ? "text-emerald-500" : "text-slate-400"}`}>
                {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className='w-full flex-1 flex flex-col pt-6 px-4 md:px-8 pb-[100px] overflow-auto gap-3 bg-slate-50'>

            {showPicker && (
              <div className='absolute bottom-[110px] left-[20px] z-[100] shadow-xl rounded-xl overflow-hidden'>
                <EmojiPicker width={280} height={350} onEmojiClick={onEmojiClick} />
              </div>
            )}

            {messages && messages.map((mess, index) => (
              mess.sender == userData._id
                ? <SenderMessage key={mess._id || index} image={mess.image} message={mess.message} />
                : <ReceiverMessage key={mess._id || index} image={mess.image} message={mess.message} />
            ))}

            {isTyping && (
              <div className='flex items-end gap-2 justify-start'>
                <div className='w-[32px] h-[32px] rounded-full overflow-hidden flex justify-center items-center bg-white ring-1 ring-slate-200 flex-shrink-0'>
                  <img src={selectedUser?.image || dp} alt="" className='w-full h-full object-cover' />
                </div>
                <div className='w-fit px-4 py-3 bg-white rounded-2xl rounded-bl-sm shadow-md shadow-slate-200/70 border border-slate-100 flex items-center gap-1'>
                  <span className='w-[7px] h-[7px] bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]'></span>
                  <span className='w-[7px] h-[7px] bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]'></span>
                  <span className='w-[7px] h-[7px] bg-slate-400 rounded-full animate-bounce'></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>

          </div>
        </div>
      }

      {/* Input bar */}
      {selectedUser && (
        <div className='w-full lg:w-[70%] fixed bottom-0 flex items-center justify-center pb-5 pt-3 px-3 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent'>

          {frontendImage && (
            <div className='absolute bottom-[80px] right-[8%] lg:right-[16%]'>
              <img src={frontendImage} alt="" className='w-[80px] h-[80px] object-cover rounded-xl shadow-lg ring-2 ring-white' />
              <button
                type="button"
                className='absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-red-500'
                onClick={() => { setFrontendImage(null); setBackendImage(null) }}
              >
                <RxCross2 size={14} />
              </button>
            </div>
          )}

          <form
            className='w-[95%] lg:w-[75%] h-[56px] bg-white shadow-lg border border-slate-200 rounded-full flex items-center gap-3 px-5 relative'
            onSubmit={handleSendMessage}
          >
            <div onClick={() => setShowPicker(prev => !prev)} className='cursor-pointer text-slate-400 hover:text-[#20c7ff] transition-colors'>
              <RiEmojiStickerLine className='w-[23px] h-[23px]' />
            </div>

            <input type="file" accept="image/*" ref={image} hidden onChange={handleImage} />

            <input
              type="text"
              className='w-full h-full px-1 outline-none border-0 text-[15px] text-slate-700 bg-transparent placeholder-slate-400'
              placeholder='Type a message'
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />

            <div onClick={() => image.current.click()} className='cursor-pointer text-slate-400 hover:text-[#20c7ff] transition-colors'>
              <FaImages className='w-[21px] h-[21px]' />
            </div>

            {(input.length > 0 || backendImage != null) && (
              <button className='w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all flex-shrink-0'>
                <RiSendPlane2Fill className='w-[17px] h-[17px] text-white' />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Empty state */}
      {!selectedUser && (
        <div className='w-full h-full flex flex-col justify-center items-center gap-2 bg-gradient-to-br from-slate-50 to-blue-50'>
          <div className='w-20 h-20 rounded-full bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] flex items-center justify-center mb-2 shadow-lg shadow-blue-200'>
            <RiSendPlane2Fill className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-slate-700 font-bold text-[32px]'>Welcome to Chatly</h1>
          <span className='text-slate-400 font-medium text-[16px]'>Select a conversation to start chatting</span>
        </div>
      )}

    </div>
  )
}

export default MessageArea
