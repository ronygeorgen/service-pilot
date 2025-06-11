import React, { useEffect, useState } from 'react';
import { adminLoginAction } from '../../features/admin/adminActions';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function UserLogin() {
    const [credentials, setCredentials] = useState({email: '', password: ''});
    const [errors, setErrors] = useState({email: '', password: ''});
    const [error_msg, setError] = useState('');
    
    const { error, isLoginned, admin_info } = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isLoginned || admin_info) {
            navigate('/');
        }
    }, [isLoginned, admin_info, navigate]);

    // Handle error state
    useEffect(() => {
        if (error) {
            setError(error);
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = { email: '', password: '' };
        let hasError = false;
        
        if (!credentials.email.trim()) {
            newErrors.email = 'Please enter an email';
            hasError = true;
        }
        if (!credentials.password.trim()) {
            newErrors.password = 'Please enter a password';
            hasError = true;
        }   
        
        setErrors(newErrors);
        if (!hasError) {
            dispatch(adminLoginAction(credentials));
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">Welcome to User Login</h1>
                    <p className="text-sm text-gray-500 mt-1">Please enter your credentials to continue.</p>
                </div>
                <div className="flex flex-col gap-4">
                    {error_msg && <p className='text-red-600 text-sm'>{error_msg}</p>}
                    <div>
                        <input 
                            type="text" 
                            placeholder="Email" 
                            value={credentials.email} 
                            onChange={(e) => {
                                setCredentials(prev => ({...prev, email: e.target.value}));
                                setErrors(prev => ({...prev, email: ''}));
                                setError('');
                            }} 
                            className="py-2 w-full px-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        {errors.email && <p className='text-sm text-red-600 pl-1'>{errors.email}</p>}
                    </div>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={credentials.password} 
                            onChange={(e) => {
                                setCredentials(prev => ({...prev, password: e.target.value}));
                                setErrors(prev => ({...prev, password: ''}));
                                setError('');
                            }} 
                            className="py-2 w-full px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        {errors.password && <p className='text-sm text-red-600 pl-1'>{errors.password}</p>}
                    </div>
                    <button 
                        type="submit" 
                        className="py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Sign In
                    </button>
                    <Link to="/admin/login/" className="text-blue-600 hover:underline text-sm text-center mt-2">
                        Are you an admin? Login here
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default UserLogin;