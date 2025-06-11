import React from 'react'
import AdminPanel from '../../components/admin/AdminPanel'
import Navbar from '../../components/admin/Navbar'

function AdminPanelPage() {
  return (
    <>  
        <Navbar is_admin={true} />
        <AdminPanel />
    </>
  )
}

export default AdminPanelPage