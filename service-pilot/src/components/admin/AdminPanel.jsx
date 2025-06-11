import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { Save, Plus, Trash } from 'lucide-react';
import Service from './Service';
import UpdateService from './UpdateService';
import { addService, setIsEdited, setMinimumPrice, setReset } from '../../features/admin/adminSlice';
import { createService, editServiceAction, getGlobalSettingsActions, globalSettingsAction, serviceListAction } from '../../features/admin/adminActions';
import { useNavigate } from "react-router-dom"

function AdminPanel() {
  const [save, setSave] = useState(false);
  const [errors, setErrors] = useState({});
    const navigate = useNavigate()

    const {selectedService, isEdited, settings, services, success, error} = useSelector(state=>state.admin)

    const dispatch = useDispatch();

    useEffect(()=>{
      if (success){
        dispatch(setReset());
        setSave(false);
        setErrors({}); // Clear errors on success
      }
    }, [success, error])

    useEffect(()=>{
      dispatch(serviceListAction());
      dispatch(getGlobalSettingsActions());
    },[])

  const saveGlobalsettings = ()=>{
    dispatch(globalSettingsAction(settings))
  }

  const handleChangeMinimumPrice = (value) => {
    const price = Number(value);
    dispatch(setMinimumPrice(price))
  };  

  const handleSave = () => {
    const newErrors = {};

    // Service Name validation
    if (!selectedService?.name?.trim()) {
      newErrors.name = "Service name is required.";
    }

    // Check if service has at least one question
    if (!selectedService?.questions || selectedService.questions.length === 0) {
      newErrors.questions_required = "Service must have at least one question.";
    }

    // Check if service has at least one pricing option
    if (!selectedService?.pricingOptions || selectedService.pricingOptions.length === 0) {
      newErrors.pricing_options_required = "Service must have at least one pricing option.";
    }

    // Check if service has at least one feature
    if (!selectedService?.features || selectedService.features.length === 0) {
      newErrors.features_required = "Service must have at least one feature.";
    }

    // Questions validation
    selectedService?.questions?.forEach((question, index) => {
      if (!question.text?.trim()) {
        newErrors[`question_${question.id}_text`] = `Question ${index + 1} text is required.`;
      }

      if (!question.type) {
        newErrors[`question_${question.id}_type`] = `Question ${index + 1} type is required.`;
      }

      if ((question.type === 'choice' || question.type === 'select') && (!question.options || question.options.length === 0)) {
        newErrors[`question_${question.id}_options`] = `Question ${index + 1} must have options.`;
      }

      if (question.type === 'boolean' && (question.unit_price === null || question.unit_price === undefined || question.unit_price < 0)) {
        newErrors[`question_${question.id}_unit_price`] = `Question ${index + 1} must have a valid unit price (≥ 0).`;
      }

      if (question.type === 'number' && question.unit_price !== null && question.unit_price !== undefined && question.unit_price < 0) {
        newErrors[`question_${question.id}_unit_price`] = `Question ${index + 1} unit price must be ≥ 0.`;
      }
    });

    // Pricing Options validation
    selectedService?.pricingOptions?.forEach((option, index) => {
      if (!option.name?.trim()) {
        newErrors[`pricing_${option.id}_name`] = `Pricing option ${index + 1} name is required.`;
      }
      if (option.discount < 0 || option.discount > 100) {
        newErrors[`pricing_${option.id}_discount`] = `Pricing option ${index + 1} discount must be between 0 and 100.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    if (selectedService?.isNew) {
      dispatch(createService(selectedService));
    } else {
      dispatch(editServiceAction(selectedService));
    }
  };

  const handleAddService = () => {
    if (isEdited) {
      const confirmed = window.confirm('Your data will be lost. Do you want to continue?');
      if (!confirmed) return;
    }
    dispatch(setIsEdited(false))
    dispatch(addService())
    setErrors({}); // Clear errors when adding new service
  }

  console.log(settings, 'sev', success)

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
                {services?.length > 0 ? (
                  services?.map((service) => (
                    <Service key={service.id} service={service} setErrors={setErrors}/>
                  ))
                ) : (
                  <p>No services available.</p>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Global Settings</h3>
                <div className='space-y-1'>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Price ($)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={settings?.minimum_price ? settings?.minimum_price : 0}
                    onChange={(e) => {handleChangeMinimumPrice(e.target.value); setSave(true);}}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {save && 
                    <button className='border px-4 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-semibold' onClick={saveGlobalsettings}>Save</button>
                  }
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
                  <UpdateService errors={errors} setErrors={setErrors}/>
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