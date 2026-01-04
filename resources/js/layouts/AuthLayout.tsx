import React, { FC } from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout: FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default AuthLayout