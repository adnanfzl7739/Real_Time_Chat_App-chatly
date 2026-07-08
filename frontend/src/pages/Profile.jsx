import React, { useRef, useState } from 'react'
import dp from "../assets/dp.webp"
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../main';
import { setUserData } from '../redux/userSlice';
import { User, Mail } from 'lucide-react';

function Profile() {
    let { userData } = useSelector(state => state.user)
    let dispatch = useDispatch()
    let navigate = useNavigate()
    let [name, setName] = useState(userData.name || "")
    let [frontendImage, setFrontendImage] = useState(userData.image || dp)
    let [backendImage, setBackendImage] = useState(null)
    let image = useRef()
    let [saving, setSaving] = useState(false)
    const handleImage = (e) => {
        let file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleProfile = async (e) => {

        e.preventDefault()
        setSaving(true)
        try {

            let formData = new FormData()
            formData.append("name", name)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            let result = await axios.put(`${serverUrl}/api/user/profile`, formData, { withCredentials: true })
            setSaving(false)
            dispatch(setUserData(result.data))
            navigate("/")
        } catch (error) {
            console.log(error)
            setSaving(false)
        }
    }
    return (
        <div className='w-full min-h-[100vh] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col justify-center items-center gap-6 p-4 relative'>

            <button
                className='fixed top-5 left-5 w-[42px] h-[42px] rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#20c7ff] transition-colors'
                onClick={() => navigate("/")}
            >
                <IoIosArrowRoundBack className='w-[26px] h-[26px]' />
            </button>

            <div className='bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 w-full max-w-[420px] flex flex-col items-center px-8 py-10 gap-6'>

                <h1 className='text-slate-800 font-bold text-[22px] tracking-tight -mb-2'>Edit Profile</h1>

                <div className='relative cursor-pointer group' onClick={() => image.current.click()}>
                    <div className='w-[140px] h-[140px] rounded-full overflow-hidden ring-4 ring-slate-100 group-hover:ring-[#20c7ff]/30 transition-all'>
                        <img src={frontendImage} alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className='absolute bottom-1 right-1 w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] flex justify-center items-center shadow-md ring-2 ring-white'>
                        <IoCameraOutline className='text-white w-[19px] h-[19px]' />
                    </div>
                </div>

                <form className='w-full flex flex-col gap-5' onSubmit={handleProfile}>
                    <input type="file" accept='image/*' ref={image} hidden onChange={handleImage} />

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-slate-600 text-[13px] font-medium ml-1'>Display name</label>
                        <div className='w-full h-[48px] flex items-center gap-2 border border-slate-200 focus-within:border-[#20c7ff] focus-within:ring-2 focus-within:ring-[#20c7ff]/20 rounded-xl px-4 transition-all bg-slate-50/50'>
                            <User size={18} className='text-slate-400' />
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className='w-full h-full outline-none bg-transparent text-slate-700 text-[15px]'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-slate-400 text-[13px] font-medium ml-1'>Username</label>
                        <div className='w-full h-[48px] flex items-center gap-2 border border-slate-200 rounded-xl px-4 bg-slate-100'>
                            <User size={18} className='text-slate-300' />
                            <input type="text" readOnly className='w-full h-full outline-none bg-transparent text-slate-400 text-[15px] cursor-not-allowed' value={userData?.userName} />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-slate-400 text-[13px] font-medium ml-1'>Email</label>
                        <div className='w-full h-[48px] flex items-center gap-2 border border-slate-200 rounded-xl px-4 bg-slate-100'>
                            <Mail size={18} className='text-slate-300' />
                            <input type="email" readOnly className='w-full h-full outline-none bg-transparent text-slate-400 text-[15px] cursor-not-allowed' value={userData?.email} />
                        </div>
                    </div>

                    <button
                        className='w-full h-[48px] mt-2 bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] rounded-xl text-white text-[16px] font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60'
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Profile