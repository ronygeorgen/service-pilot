import { LogOut, User } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminLogout } from '../../features/admin/adminSlice';

const ALLOWED_LOCATIONS = ["b8qvo7VooP3JD3dIZU42", "dIzpiRxQkIWkmFfr8T5j"];

function Navbar({ is_admin = false, is_user = false }) {
    const { admin_info } = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const locationId = params.get("location");

    const isLocationAuthenticated = locationId && ALLOWED_LOCATIONS.includes(locationId);
    const isLoggedIn = !!admin_info;

    const handleLogout = () => {
        dispatch(adminLogout());
        if (isLocationAuthenticated) {
            // Stay on the same page with location param
            navigate(is_admin ? `/admin?location=${locationId}` : `/?location=${locationId}`);
        } else {
            navigate(is_admin ? '/admin/login' : '/user/login');
        }
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <img src="/ServicePilotLogoNavBar.png" alt="Service Pilot Logo" className="h-8 w-auto" />
                    </div>

                    {/* User Info and Controls */}
                    <div className="flex items-center space-x-4">
                        {/* User display */}
                        {/* <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-gray-500" />
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {admin_info?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {isLoggedIn
                                        ? admin_info?.email
                                        : isLocationAuthenticated
                                            ? `Guest - ${locationId}`
                                            : ''}
                                </p>
                            </div>
                        </div> */}

                        {/* Logout only if fully logged in */}
                        {isLoggedIn && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        )}

                        {/* Conditionally render switch buttons */}
                        {is_admin && (
                            <button
                                onClick={() =>
                                    navigate(locationId
                                        ? `/?location=${locationId}`
                                        : '/user/login')
                                }
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            >
                                <span>Switch to User</span>
                            </button>
                        )}

                        {is_user && (
                            <button
                                onClick={() =>
                                    navigate(locationId
                                        ? `/admin?location=${locationId}`
                                        : '/admin/login')
                                }
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            >
                                <span>Switch to Admin</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
