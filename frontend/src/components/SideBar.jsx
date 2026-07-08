import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dp from "../assets/dp.webp"
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import { HiOutlineLink } from "react-icons/hi";
import { IoCopyOutline } from "react-icons/io5";
import { serverUrl } from '../main';
import axios from 'axios';
import { setOtherUsers, setSearchData, setSelectedUser, setUserData, clearUnread } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function SideBar() {
    let { userData, otherUsers, selectedUser, onlineUsers, searchData, unreadMessages } = useSelector(state => state.user)
    let [search, setSearch] = useState(false)
    let [input, setInput] = useState("")
    let [showConnectModal, setShowConnectModal] = useState(false)
    let [connectCode, setConnectCode] = useState("")
    let [connectError, setConnectError] = useState("")
    let [connecting, setConnecting] = useState(false)
    let [copied, setCopied] = useState(false)
    let dispatch = useDispatch()
    let navigate = useNavigate()

    const handleLogOut = async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
            dispatch(setUserData(null))
            dispatch(setOtherUsers(null))
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const handlesearch = async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/user/search?query=${input}`, { withCredentials: true })
            dispatch(setSearchData(result.data))

        }
        catch (error) {
            console.log(error)
        }
    }

    const handleConnect = async (e) => {
        e.preventDefault()
        setConnecting(true)
        setConnectError("")
        try {
            let result = await axios.post(`${serverUrl}/api/user/connect`, { connectionCode: connectCode }, { withCredentials: true })
            dispatch(setUserData(result.data))

            let othersResult = await axios.get(`${serverUrl}/api/user/others`, { withCredentials: true })
            dispatch(setOtherUsers(othersResult.data))

            setConnectCode("")
            setConnecting(false)
            setShowConnectModal(false)
        } catch (error) {
            setConnecting(false)
            setConnectError(error?.response?.data?.message || "something went wrong")
        }
    }

    const handleCopyCode = () => {
        navigator.clipboard.writeText(userData?.connectionCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleSelectUser = (user) => {
        dispatch(setSelectedUser(user))
        dispatch(clearUnread(user._id))
    }

    useEffect(() => {
        if (input) {
            handlesearch()
        }

    }, [input])

    return (
        <div className={`lg:w-[30%] w-full h-full overflow-hidden lg:block bg-white border-r border-slate-200 relative flex flex-col ${!selectedUser ? "block" : "hidden"}`}>

            {/* Logout button */}
            <button
                className='w-[46px] h-[46px] rounded-full flex justify-center items-center bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-md fixed bottom-[20px] left-[14px] z-[200]'
                onClick={handleLogOut}
                title="Logout"
            >
                <BiLogOutCircle className='w-[22px] h-[22px]' />
            </button>

            {/* Connect modal */}
            {showConnectModal && (
                <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-[300] px-4'>
                    <div className='w-full max-w-[380px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-slate-800 font-bold text-[18px]'>Connect with someone</h2>
                            <button onClick={() => { setShowConnectModal(false); setConnectError(""); setConnectCode("") }}>
                                <RxCross2 className='w-[20px] h-[20px] text-slate-400 hover:text-slate-600' />
                            </button>
                        </div>
                        <p className='text-slate-500 text-[13px] -mt-2'>Enter their connection code to start chatting.</p>

                        <form className='flex flex-col gap-3' onSubmit={handleConnect}>
                            <input
                                type="text"
                                placeholder='e.g. A1B2C3D4'
                                className='w-full h-[46px] border border-slate-200 focus:border-[#20c7ff] focus:ring-2 focus:ring-[#20c7ff]/20 rounded-xl px-4 outline-none text-slate-700 text-[15px] tracking-wider uppercase transition-all'
                                value={connectCode}
                                onChange={(e) => setConnectCode(e.target.value)}
                            />
                            {connectError && <p className='text-red-500 text-[13px]'>{"*" + connectError}</p>}
                            <button
                                className='w-full h-[46px] bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] rounded-xl text-white font-semibold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60'
                                disabled={connecting}
                            >
                                {connecting ? "Connecting..." : "Connect"}
                            </button>
                        </form>

                        <div className='border-t border-slate-100 pt-4 flex flex-col gap-2'>
                            <span className='text-slate-500 text-[13px]'>Your connection code</span>
                            <div className='w-full h-[46px] bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between px-4'>
                                <span className='text-slate-700 font-semibold text-[16px] tracking-wider'>{userData?.connectionCode}</span>
                                <button type="button" onClick={handleCopyCode} className='text-slate-400 hover:text-[#20c7ff] transition-colors'>
                                    <IoCopyOutline className='w-[18px] h-[18px]' />
                                </button>
                            </div>
                            {copied && <span className='text-emerald-500 text-[12px]'>Copied!</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Search results dropdown */}
            {input.length > 0 && (
                <div className='absolute top-[190px] left-0 bg-white w-full max-h-[420px] overflow-y-auto flex flex-col z-[150] shadow-xl border border-slate-100 rounded-b-xl'>
                    {searchData?.map((user) => (
                        <div
                            key={user._id}
                            className='w-full h-[64px] flex items-center gap-3 px-4 hover:bg-slate-50 border-b border-slate-100 cursor-pointer transition-colors'
                            onClick={() => {
                                handleSelectUser(user)
                                setInput("")
                                setSearch(false)
                            }}
                        >
                            <div className='relative w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0 ring-1 ring-slate-200'>
                                <img src={user.image || dp} alt="" className='w-full h-full object-cover' />
                                {onlineUsers?.includes(user._id) &&
                                    <span className='w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 bg-emerald-500 ring-2 ring-white'></span>}
                            </div>
                            <h1 className='text-slate-800 font-medium text-[15px]'>{user.name || user.userName}</h1>
                        </div>
                    ))}
                </div>
            )}

            {/* Header */}
            <div className='w-full px-5 pt-6 pb-4 bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff]'>
                <div className='w-full flex justify-between items-center mb-2'>
                    <h1 className='text-white font-bold text-[22px] tracking-tight'>chatly</h1>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setShowConnectModal(true)}
                            className='w-[38px] h-[38px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors'
                            title="Connect with someone"
                        >
                            <HiOutlineLink className='w-[19px] h-[19px] text-white' />
                        </button>
                        <div
                            className='w-[42px] h-[42px] rounded-full overflow-hidden flex justify-center items-center bg-white cursor-pointer ring-2 ring-white/40 hover:ring-white transition-all'
                            onClick={() => navigate("/profile")}
                        >
                            <img src={userData.image || dp} alt="" className='w-full h-full object-cover' />
                        </div>
                    </div>
                </div>

                <p className='text-white/90 text-[15px] font-medium mb-1'>Hi, {userData.name || "user"} </p>
                <p className='text-white/70 text-[12px] mb-3'>Your code: <span className='font-semibold tracking-wider'>{userData?.connectionCode}</span></p>

                {/* Search bar */}
                {!search ? (
                    <div
                        className='w-full h-[46px] bg-white/95 rounded-full flex items-center gap-2 px-4 cursor-pointer shadow-sm hover:bg-white transition-colors'
                        onClick={() => setSearch(true)}
                    >
                        <IoIosSearch className='w-[20px] h-[20px] text-slate-400' />
                        <span className='text-slate-400 text-[14px]'>Search users...</span>
                    </div>
                ) : (
                    <form className='w-full h-[46px] bg-white rounded-full flex items-center gap-2 px-4 shadow-sm relative'>
                        <IoIosSearch className='w-[20px] h-[20px] text-slate-400 flex-shrink-0' />
                        <input
                            type="text"
                            placeholder='Search users...'
                            className='w-full h-full text-[14px] outline-none border-0 bg-transparent text-slate-700'
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                        />
                        <RxCross2 className='w-[20px] h-[20px] text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0' onClick={() => setSearch(false)} />
                    </form>
                )}

                {/* Online users strip */}
                {!search && (
                    <div className='w-full flex items-center gap-3 overflow-x-auto pt-4 pb-1'>
                        {otherUsers?.map((user) => (
                            onlineUsers?.includes(user._id) &&
                            <div
                                key={user._id}
                                className='relative flex-shrink-0 cursor-pointer'
                                onClick={() => handleSelectUser(user)}
                                title={user.name || user.userName}
                            >
                                <div className='w-[46px] h-[46px] rounded-full overflow-hidden ring-2 ring-white/70'>
                                    <img src={user.image || dp} alt="" className='w-full h-full object-cover' />
                                </div>
                                <span className='w-[11px] h-[11px] rounded-full absolute bottom-0 right-0 bg-emerald-500 ring-2 ring-white'></span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat list */}
            <div className='w-full flex-1 overflow-y-auto flex flex-col px-2 py-3 gap-1'>
                {otherUsers?.length === 0 && !search && (
                    <div className='w-full flex flex-col items-center justify-center gap-2 py-10 px-4 text-center'>
                        <HiOutlineLink className='w-8 h-8 text-slate-300' />
                        <p className='text-slate-400 text-[14px]'>No connections yet. Share your code or enter one to start chatting.</p>
                    </div>
                )}
                {otherUsers?.map((user) => {
                    const unreadCount = unreadMessages?.[user._id] || 0
                    return (
                        <div
                            key={user._id}
                            className='w-full h-[68px] flex items-center gap-3 px-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors'
                            onClick={() => handleSelectUser(user)}
                        >
                            <div className='relative flex-shrink-0'>
                                <div className='w-[50px] h-[50px] rounded-full overflow-hidden ring-1 ring-slate-200'>
                                    <img src={user.image || dp} alt="" className='w-full h-full object-cover' />
                                </div>
                                {onlineUsers?.includes(user._id) &&
                                    <span className='w-[11px] h-[11px] rounded-full absolute bottom-0 right-0 bg-emerald-500 ring-2 ring-white'></span>}
                            </div>
                            <div className='flex flex-col overflow-hidden flex-1'>
                                <h1 className={`text-[15px] truncate ${unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-800 font-semibold'}`}>{user.name || user.userName}</h1>
                                <span className={`text-[13px] ${unreadCount > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                    {unreadCount > 0 ? "New message" : (onlineUsers?.includes(user._id) ? "Online" : "Offline")}
                                </span>
                            </div>
                            {unreadCount > 0 && (
                                <div className='min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] flex items-center justify-center flex-shrink-0'>
                                    <span className='text-white text-[11px] font-bold'>{unreadCount > 9 ? "9+" : unreadCount}</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default SideBar
