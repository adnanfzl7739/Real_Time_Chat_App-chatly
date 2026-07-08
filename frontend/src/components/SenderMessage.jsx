import React, { useEffect, useRef } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
function SenderMessage({ image, message }) {
  let scroll = useRef()
  let { userData } = useSelector(state => state.user)
  useEffect(() => {
    scroll?.current.scrollIntoView({ behavior: "smooth" })
  }, [message, image])
  const handleImageScroll = () => {
    scroll?.current.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <div className='flex items-end gap-2 justify-end' >

      <div ref={scroll} className='w-fit max-w-[75%] md:max-w-[420px] px-4 py-2.5 bg-gradient-to-r from-[#1EA7E0] to-[#20c7ff] text-white text-[15px] leading-snug rounded-2xl rounded-br-sm shadow-md shadow-blue-100 flex flex-col gap-1.5'>
        {image && <img src={image} alt="" className='w-[180px] rounded-lg' onLoad={handleImageScroll} />}
        {message && <span className='break-words'>{message}</span>}
      </div>
      <div className='w-[32px] h-[32px] rounded-full overflow-hidden flex justify-center items-center bg-white ring-1 ring-slate-200 flex-shrink-0' >
        <img src={userData.image || dp} alt="" className='w-full h-full object-cover' />
      </div>
    </div>
  )
}

export default SenderMessage