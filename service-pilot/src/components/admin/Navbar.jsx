import { LogOut, User } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Navbar() {
    const admin_info = useSelector(state=>state.admin.admin_info)

    const navigate = useNavigate();
    const handleLogout = ()=>{
        localStorage.setItem('access_token', '')
        localStorage.setItem('refresh_token', '')
        navigate('/admin/login')
    }
    console.log(admin_info, 'add');
    
  return (
    <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ServicePro</h1>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">username</p>
                  <p className="text-xs text-gray-500">{admin_info?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}

export default Navbar
