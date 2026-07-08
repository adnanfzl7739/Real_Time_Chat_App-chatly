import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUser, setUserData } from '../redux/userSlice'
import { Mail, Lock, Eye, EyeOff, MessageCircle } from 'lucide-react'

function Login() {
    let navigate = useNavigate()
    let [show, setShow] = useState(false)
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let [loading, setLoading] = useState(false)
    let [err, setErr] = useState("")
    let dispatch = useDispatch()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let result = await axios.post(`${serverUrl}/api/auth/login`, {
                email, password
            }, { withCredentials: true })
            dispatch(setUserData(result.data))
            dispatch(setSelectedUser(null))
            navigate("/")
            setEmail("")
            setPassword("")
            setLoading(false)
            setErr("")
        } catch (error) {
            console.log(error)
            setLoading(false)
            setErr(error.response.data.message)
        }
    }

    return (
        <div className='w-full min-h-[100vh] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4'>
            <div className='w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden'>

                {/* Header */}
                <div className='w-full px-8 pt-10 pb-8 bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center'>
                        <MessageCircle className='text-white' size={28} strokeWidth={2.2} />
                    </div>
                    <h1 className='text-white font-bold text-[24px] tracking-tight'>Welcome back to Chatly</h1>
                    <p className='text-white/80 text-[14px] -mt-1'>Sign in to continue your conversations</p>
                </div>

                {/* Form */}
                <form className='w-full flex flex-col gap-5 px-8 py-8' onSubmit={handleLogin}>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-slate-600 text-[13px] font-medium ml-1'>Email address</label>
                        <div className='w-full h-[48px] flex items-center gap-2 border border-slate-200 focus-within:border-[#20c7ff] focus-within:ring-2 focus-within:ring-[#20c7ff]/20 rounded-xl px-4 transition-all bg-slate-50/50'>
                            <Mail size={18} className='text-slate-400' />
                            <input
                                type="email"
                                placeholder='you@example.com'
                                className='w-full h-full outline-none bg-transparent text-slate-700 text-[15px]'
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-slate-600 text-[13px] font-medium ml-1'>Password</label>
                        <div className='w-full h-[48px] flex items-center gap-2 border border-slate-200 focus-within:border-[#20c7ff] focus-within:ring-2 focus-within:ring-[#20c7ff]/20 rounded-xl px-4 transition-all bg-slate-50/50'>
                            <Lock size={18} className='text-slate-400' />
                            <input
                                type={`${show ? "text" : "password"}`}
                                placeholder='••••••••'
                                className='w-full h-full outline-none bg-transparent text-slate-700 text-[15px]'
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                            <span className='cursor-pointer text-slate-400 hover:text-[#20c7ff] transition-colors' onClick={() => setShow(prev => !prev)}>
                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    {err && <p className='text-red-500 text-[13px] -mt-2 ml-1'>{"*" + err}</p>}

                    <button
                        className='w-full h-[48px] mt-2 bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] rounded-xl text-white text-[16px] font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60'
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className='text-center text-slate-500 text-[14px] mt-2 cursor-pointer' onClick={() => navigate("/signup")}>
                        Don't have an account? <span className='text-[#20c7ff] font-semibold'>Sign up</span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login