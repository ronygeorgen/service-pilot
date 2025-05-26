import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPricing, addQuestion, deletePricing, deleteQuestion, updatePricing, updateQuestion, updateService } from '../../features/admin/adminSlice';
import { Plus, Trash } from 'lucide-react';

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
               className="flex items-center gap-1 text-sm py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                           <option value="select">Select (Dropdown)</option>
                           <option value="boolean">Yes/No</option>
                        </select>
                     </div>
                     
                     {(question.type === 'number' || question.type === 'select') && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (comma separated)
                        </label>
                        <input
                        type="text"
                        value={question.options?.join(', ') || ''}
                        onChange={(e) => handleUpdateQuestion(
                              question.id,
                              { options: e.target.value.split(',').map(o => o.trim()) }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={question.type === 'number' ? "Small, Medium, Large" : "Option 1, Option 2"}
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
                        value={question.unitPrice || null}
                        onChange={(e) => handleUpdateQuestion(
                              question.id,
                              { unitPrice: Number(e.target.value) }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                        Price when answered "Yes"
                        </p>
                     </div>
                     
                     )}
                     
                     {(question.type === 'number' || question.type === 'select') && question.options && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                        Option Prices
                        </label>
                        <div className="space-y-3">
                        {question.options.map(option => (
                           <div key={option} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-1/3">{option}</span>
                              <div className="flex-1">
                                 <input
                                 type="number"
                                 value={question.optionPrices?.[option] || 0}
                                    onChange={(e) => handleUpdateOptionPrice(
                                       question.id,
                                       option,
                                       Number(e.target.value)
                                    )}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="0"
                                 />
                              </div>
                           </div>
                        ))}
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
            <div className="flex justify-between items-center my-6">
               <h2 className="text-lg font-semibold text-gray-800">Pricing Options</h2>
               <button
               onClick={handleAddPricingOption}
               className="flex items-center gap-1 text-sm py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
               >
               <Plus size={16} />
               Add Option
               </button>
            </div>
            
            <div className="space-y-4">
               {selectedService.pricingOptions?.map(option => (
               <div key={option.id} className="flex gap-4 items-center border border-gray-200 rounded-lg p-4">
                  <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                           Option Name
                     </label>
                     <input
                           type="text"
                           value={option.name}
                           onChange={(e) => handleUpdatePricingOption(
                              option.id,
                              { name: e.target.value }
                           )}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
                  
                  <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                  </label>
                     <input
                           type="number"
                           min="0"
                           max="100"
                           value={option.discount}
                           onChange={(e) => handleUpdatePricingOption(
                              option.id,
                              { discount: Number(e.target.value) }
                           )}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
                  
                  <div className="flex items-end h-full pb-1">
                     <button className="text-red-500 hover:bg-red-50 p-2 rounded" 
                        onClick={()=>dispatch(deletePricing({optionId:option.id}))}>
                        <Trash size={18} />
                     </button>
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
