import React, { useEffect, useState } from 'react'
import { adminLoginAction } from '../../../features/admin/adminActions';
import { useDispatch, useSelector } from 'react-redux';
import { setReset } from '../../../features/admin/adminSlice';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [credentials, setCredentials] = useState({email:'', password:''});
    const [errors, setErrors] = useState({email:'', password:''})
    const [error_msg, setError] = useState('')

    const {error, success, isLoggined, admin_info} = useSelector(state=>state.admin)

    const dispatch = useDispatch();
    const navigate = useNavigate();

    console.log(error, 'dd')
    useEffect(()=>{
        if(admin_info){
            navigate('/admin')
        }
    },[])
    useEffect(()=>{
        if (success){
            navigate('/admin');
        }
        if (error){
            setError(error);
        }
        dispatch(setReset());
    },[error, success])

    const handleSubmit = ()=>{
        const newErrors = { email: '', password: '' };
        let hasError = false;
        if (!credentials.email.trim()){
            newErrors.email = 'Please enter an email';
            hasError = true;
        }
        if (!credentials.password.trim()){
            newErrors.password = 'Please enter a password';
            hasError = true;
        }   
        setErrors(newErrors);
        if (!hasError) {
            dispatch(adminLoginAction(credentials))
        }
    }
    console.log(errors);
    

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold text-blue-600">Welcome Back, Admin</h1>
                <p className="text-sm text-gray-500 mt-1">Please enter your credentials to continue.</p>
            </div>
            <div className="flex flex-col gap-4">
                <p className='text-red-600 text-sm'>{error_msg}</p>
                <div className=''>
                    <input type="text" placeholder="Email" value={credentials.email} onChange={(e)=>{setCredentials(prev=>({...prev,email:e.target.value})); setErrors(prev=>({...prev, email:''})); setError('')}} className="py-2 w-full px-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"/>
                    <p className='text-sm text-red-600 pl-1'>{errors.email}</p>
                </div>
                <div>
                    <input type="password" placeholder="Password" value={credentials.password} onChange={(e)=>{setCredentials(prev=>({...prev,password:e.target.value})); setErrors(prev=>({...prev, password:''}));setError('')}} className="py-2 w-full px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"/>
                    <p className='text-sm text-red-600 pl-1'>{errors.password}</p>
                </div>
                <button className="py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition" onClick={handleSubmit}>
                    Sign In
                </button>
            </div>
        </div>
    </div>
  )
}

export default Login
