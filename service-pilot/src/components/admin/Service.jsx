import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { deleteService, setIsEdited, setSelectedService } from '../../features/admin/adminSlice';
import { Trash } from 'lucide-react';
import { deleteServiceAction } from '../../features/admin/adminActions';

function Service({service}) {
    const [showConfirm, setShowConfirm] = useState(false);

    const dispatch = useDispatch();
    const selectedService = useSelector(state=>state.admin.selectedService)
    const isEdited = useSelector(state=>state.admin.isEdited)

    const handleClick = ()=>{
        if (isEdited) {
            const confirmed = window.confirm('Your data will be lost. Do you want to continue?');
            if (!confirmed) return;
        }
        dispatch(setIsEdited(false))
        dispatch(setSelectedService(service))
    }

    const confirmDelete = () => {
        dispatch(deleteService({ serviceId: service.id }));
        dispatch(deleteServiceAction(service.id));
        setShowConfirm(false);
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
          </div>
        </div>
      )}
    </>
  )
}

export default Service
