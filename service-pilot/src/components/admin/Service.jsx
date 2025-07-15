import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { deleteService, setIsEdited, setReset, setSelectedService } from '../../features/admin/adminSlice';
import { Trash } from 'lucide-react';
import { deleteServiceAction } from '../../features/admin/adminActions';

function Service({service, setErrors}) {
    const [showConfirm, setShowConfirm] = useState(false);

    const dispatch = useDispatch();
    const {selectedService, isEdited, pending, success} = useSelector(state=>state.admin)

    useEffect(()=>{
      if (success){
        setShowConfirm(false);
      }
      dispatch(setReset());
    },[success])

    const handleClick = ()=>{
        if (isEdited) {
            const confirmed = window.confirm('Your data will be lost. Do you want to continue?');
            if (!confirmed) return;
        }
        setErrors('')
        dispatch(setIsEdited(false))
        dispatch(setSelectedService(service))
    }

    const confirmDelete = () => {
      if(service?.isNew){
        dispatch(deleteService(service.id));
      }else{
          dispatch(deleteServiceAction(service.id));
        }
    };
  return (
    <>
    
    <div 
        onClick={handleClick}
        className={`p-3 rounded cursor-pointer flex justify-between items-center ${
            selectedService?.id === service.id 
            ? 'bg-blue-50 border border-blue-200' 
            : 'hover:bg-gray-50'
        }`}
        >
        <span className="font-medium">{service.name}</span>
        <button
            onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true); // show popup
            }}
            className="text-red-500 hover:bg-red-50 p-1 rounded"
        >
            <Trash size={16} />
        </button>
    </div>

    {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-md w-72">
            {
              pending?
              <>
            <p className="text-center text-gray-800 font-semibold mb-">Deleting</p>
            <div className="flex justify-center items-center h-32">
      <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
            </>
              :
            
              <>
            <p className="text-center text-gray-800 font-semibold mb-4">Are you sure you want to delete?</p>
            <div className="flex justify-between">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
            </>
}
          </div>
        </div>
      )}
    </>
  )
}

export default Service
