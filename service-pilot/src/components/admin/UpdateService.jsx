import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addFeature, addPricing, addQuestion, deletePricing, deleteQuestion, removeFeature, toggleFeature, updatePricing, updateQuestion, updateQuestionOptionPrice, updateService } from '../../features/admin/adminSlice';
import { CircleMinus, Plus, Trash } from 'lucide-react';

function UpdateService() {
   const selectedService = useSelector(state=>state.admin.selectedService)
   const dispatch = useDispatch();
   console.log(selectedService, 'selee');

   const handleUpdateQuestion = (questionId, updates) => {
      dispatch(updateQuestion({questionId, updates}))
   };

   const handleUpdateService = (update)=>{
      dispatch(updateService(update));
   }

   const handleAddPricingOption =()=>{
      dispatch(addPricing())
   }

   const handleUpdatePricingOption = (optionId, updates)=> {
    dispatch(updatePricing({optionId, updates}));
  };

  const handleUpdateOptionPrice = (questionId, option, value)=>{
   console.log(questionId, option, value)
   dispatch(updateQuestionOptionPrice({questionId, value: { [option]: value }}))
  }

  console.log(selectedService, 'selected service');

  const handleAddFeature = () => {
  const name = prompt("Enter new feature name:");
  if (!name) return;
  const newFeature = { id: Date.now(), name };
  dispatch(addFeature(newFeature));
};

const handleToggleFeature = (optionId, featureId) => {
   console.log(featureId, 'feature');
   
  dispatch(toggleFeature({optionId, featureId}));
};

const handleRemoveFeature = (featureId) => {
  dispatch(removeFeature(featureId));
};
  
  return (
   <>
      <div>
         <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Service Name
            </label>
            <input
               type="text"
               value={selectedService.name}
               onChange={(e) => handleUpdateService({
                  name: e.target.value
               })}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
            
         <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
            <button
               onClick={() => dispatch(addQuestion())}
               className="flex items-center justify-center w-1/5 gap-1 text-sm py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
               <Plus size={16} />
               Add Question
            </button>
         </div>
            
         <div className="space-y-6">
            {selectedService.questions.map((question, index) => (
               <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-medium">Question {index + 1}</h4>
                     <button
                     onClick={() => dispatch(deleteQuestion({questionId:question.id}))}
                     className="text-red-500 hover:bg-red-50 p-1 rounded"
                     >
                     <Trash size={16} />
                     </button>
                  </div>
               
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Question Text
                        </label>
                        <input
                           type="text"
                           value={question.text}
                           onChange={(e) => handleUpdateQuestion(
                           question.id, 
                           { text: e.target.value }
                           )}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                           Question Type
                        </label>
                        <select
                           value={question.type}
                           onChange={(e) => handleUpdateQuestion(
                           question.id,
                           { type: e.target.value}
                           )}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                           <option value="number">Number</option>
                           <option value="boolean">Yes/No</option>
                        </select>
                     </div>
                     
                     {(question.type === 'choice' || question.type === 'select') && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (comma separated)
                        </label>
                        <input
                        type="text"
                        value={question.options?.map(opt => Object.keys(opt)[0]).join(', ') || ''}
                        onChange={(e) => handleUpdateQuestion(
                              question.id,
                              { options: e.target.value.split(',').map(label => ({
              [label.trim()]: 0
            })) }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={question.type === 'choice' ? "Small, Medium, Large" : "Option 1, Option 2"}
                        />
                     </div>
                     )}
                     
                     {question.type === 'boolean' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price ($)
                        </label>
                        <input
                        type="number"
                        value={question.unit_price || null}
                        onChange={(e) => handleUpdateQuestion(
                              question.id,
                              { unit_price: Number(e.target.value) }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                        Price when answered "Yes"
                        </p>
                     </div>
                     
                     )}
                     
                     {(question.type === 'choice' || question.type === 'select') && question.options && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                        Option Prices
                        </label>
                        <div className="space-y-3">
                        {(question.options || []).map((opt, index) => {
                           const key = Object.keys(opt)[0];
                           const value = opt[key];
                           return (
                              <div key={index} className="flex items-center gap-3">
                                 <span className="text-sm text-gray-600 w-1/3">{key}</span>
                                 <div className="flex-1">
                                 <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleUpdateOptionPrice(
                                       question.id,
                                       key,
                                       Number(e.target.value)
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                 />
                                 </div>
                              </div>
                           );
                                                      
                           })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                        Set individual prices for each option
                        </p>
                     </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
         <div>
            {/* Heading and Add Feature Button */}
            <div className="flex justify-between items-center my-6">
               <h2 className="text-lg font-semibold text-gray-800">Pricing Options</h2>
               <button
                  onClick={handleAddPricingOption}
                  className="flex items-center justify-center w-1/5 gap-1 text-sm py-1.5 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
               >
                  <Plus size={16} />
                  Add Option
               </button>
            </div>

            {/* Feature Input Area */}
            <div className="mb-4 flex gap-3">
               
               {selectedService.features?.length>0?
               selectedService.features?.map((feature) => (
                  <div key={feature.id} className=" bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                     <p className="text-sm text-gray-700">{feature.name}</p>
                     <button
                        onClick={() => handleRemoveFeature(feature.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                        >
                           <CircleMinus size={12} />
                     </button>
                  </div>
               )):<p className='flex items-center'>Add some features for pricing options</p>
               }
               <button
                  onClick={handleAddFeature}
                  className="flex items-center ml-auto justify-center w-1/5 gap-1 text-sm py-1.5 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
               >
                  <Plus size={16} />
                  Add Feature
               </button>
            </div>

            {/* Pricing Options */}
            <div className="space-y-6">
               {selectedService.pricingOptions?.map((option) => (
                  <div
                     key={option.id}
                     className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                     {/* Option Inputs */}
                     <div className="flex gap-4 items-end">
                        <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Option Name</label>
                           <input
                              type="text"
                              value={option.name}
                              onChange={(e) =>
                              handleUpdatePricingOption(option.id, { name: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                           />
                        </div>

                        <div className="flex-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                           <input
                              type="number"
                              min="0"
                              max="100"
                              value={option.discount}
                              onChange={(e) =>
                              handleUpdatePricingOption(option.id, {
                                 discount: Number(e.target.value),
                              })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                           />
                        </div>
                        <div className="flex items-end h-full pb-1">
                           <button className="text-red-500 hover:bg-red-50 p-2 rounded" 
                              onClick={()=>dispatch(deletePricing({optionId:option.id}))}>
                              <Trash size={18} />
                           </button>
                        </div>
                     </div>

                     {/* Feature Checkboxes */}
                     <div className="mt-2">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                     </label>
                     <div className="flex flex-wrap gap-4">
                        {selectedService.features?.map((feature) => (
                           <label key={feature.id} className="flex items-center gap-2 text-sm text-gray-700">
                           <input
                              type="checkbox"
                              checked={option.selectedFeatures?.find(f => f.id === feature.id)?.is_included || false}
                              onChange={() =>
                                 handleToggleFeature(option.id, feature.id)
                              }
                           />
                           {feature.name}
                           </label>
                        ))}
                     </div>
                     </div>
                  </div>
               ))}
            </div>

         </div>
      </div>
   </>
  )
}

export default UpdateService
