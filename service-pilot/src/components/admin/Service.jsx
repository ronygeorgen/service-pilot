import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { deleteService, setIsEdited, setSelectedService } from '../../features/admin/adminSlice';
import { Trash } from 'lucide-react';
import { deleteServiceAction } from '../../features/admin/adminActions';

function Service({service}) {
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
  return (
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
            dispatch(deleteService({serviceId:service.id}));
            dispatch(deleteServiceAction(service.id));
            }}
            className="text-red-500 hover:bg-red-50 p-1 rounded"
        >
            <Trash size={16} />
        </button>
    </div>
  )
}

export default Service
