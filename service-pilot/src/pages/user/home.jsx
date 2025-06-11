import React from 'react'
import Home from '../../components/user/home'
import Navbar from '../../components/admin/Navbar'

function HomePage() {
  return (
    <>
        <Navbar is_user={true} />
        <Home />
    </>
  )
}

export default HomePage