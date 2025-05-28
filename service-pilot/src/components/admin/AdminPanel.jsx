import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { Save, Plus, Trash } from 'lucide-react';
import Service from './Service';
import UpdateService from './UpdateService';
import { addService, setIsEdited, setMinimumPrice } from '../../features/admin/adminSlice';
import { createService, editServiceAction, serviceListAction } from '../../features/admin/adminActions';

function AdminPanel() {
    const settings = useSelector(state=>state.admin.settings)
    const {selectedService, isEdited} = useSelector(state=>state.admin)

    const dispatch = useDispatch();

    useEffect(()=>{
      dispatch(serviceListAction());
    },[])

  //   const handleSaveSettings = () => {
  //   updateSettings(localSettings);
  //   alert('Settings saved successfully!');
  // };

  const handleChangeMinimumPrice = (value) => {
    const price = Number(value);
    dispatch(setMinimumPrice(price))
  }; 
  const handleSave = ()=>{
    if (selectedService?.isNew){
      dispatch(createService({minimumPrice:Number(settings?.minimumPrice), services: [selectedService]}));
    }else{
      console.log('edit service');
      dispatch(editServiceAction(selectedService))
    }
  }

  const handleAddService = () => {
    if (isEdited) {
      const confirmed = window.confirm('Your data will be lost. Do you want to continue?');
      if (!confirmed) return;
    }
    dispatch(setIsEdited(false))
    dispatch(addService())
  }

  console.log(settings, 'sev')

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-11">
        <h1 className="text-4xl font-bold text-gray-800">Quote Widget Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button className='py-3 px-5 font-medium bg-blue-50 w-full'>Services & Questions</button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-8">
            {/* Service List */}
            <div className="w-1/3 border-r pr-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Services</h2>
                <button
                  onClick={handleAddService}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-2">
                {settings?.services?.length > 0 ? (
                  settings?.services.map((service) => (
                    <Service key={service.id} service={service} />
                  ))
                ) : (
                  <p>No services available.</p>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Global Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Price ($)
                  </label>
                  <input type="number" value={settings?.services ? settings?.services[0].minimum_price:0}
                    onChange={(e) => handleChangeMinimumPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The minimum price for any service
                  </p>
                </div>
              </div>
            </div>
            
            {/* Question Editor */}
            <div className="w-2/3">
                {selectedService?
                <>
                {isEdited&&
                  <div className='w-full flex justify-end'>
                    <button className="flex items-center gap-1 py-2 px-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    onClick={handleSave}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                }
                  <UpdateService />
                </>
                :
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-center">
                    <p className="text-gray-500">Select a service to edit its questions</p>
                    <button onClick={handleAddService} className="mt-2 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700">
                      <Plus size={16} />
                      Add New Service
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
