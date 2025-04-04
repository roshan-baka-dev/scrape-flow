import Logo from '@/components/Logo'
import React, { ReactNode } from 'react'

function layout({children}:{children:ReactNode}) {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-10'>
        <Logo/>
        {children}
    </div>
  )
}

export default layout