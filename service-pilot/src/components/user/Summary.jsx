"use client"

import { useState } from "react"
import { useQuote } from "../../context/QuoteContext"
import { formatCurrency, applyPricingOption, calculateSavings } from "../../utils/calculations"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux' 
import { axiosInstance } from "../../services/api"

const Summary = () => {
  const { state, settings, dispatch } = useQuote()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { selectedContact } = useSelector((state) => state.contacts)
  

  const handleAddMoreServices = () => {
    dispatch({ type: "ADD_MORE_SERVICES" })
  }

  console.log('selected service details in summary page==', state.selectedServices)


const handleFinalize = async () => {
  setIsSubmitting(true);
  try {
    // Prepare the data to save in the exact format backend expects
    const quoteData = {
      contact: selectedContact.contact_id,
      services: state.selectedServices.map(service => {
        // Group answers by question ID
        const answersByQuestion = {};
        
        Object.entries(service.answers).forEach(([key, value]) => {
          const [questionId, optionLabel] = key.split('-');
          
          if (!answersByQuestion[questionId]) {
            answersByQuestion[questionId] = {
              id: parseInt(questionId),
              options: {},
              ans: false
            };
          }
          
          // Handle boolean questions
          if (value === 'Yes' || value === 'No') {
            answersByQuestion[questionId].ans = value === 'Yes';
          } 
          // Handle choice options
          else if (optionLabel) {
            answersByQuestion[questionId].options[optionLabel.toLowerCase()] = parseInt(value) || 0;
          }
        });
        
        return {
          id: service.service.id,
          questions: Object.values(answersByQuestion).map(question => {
            // Clean up the question object based on its type
            const serviceQuestion = service.service.questions.find(q => q.id === question.id);
            
            if (serviceQuestion?.type === 'boolean') {
              // For boolean questions, only include ans if true
              return {
                id: question.id,
                ans: question.ans
              };
            } else if (serviceQuestion?.type === 'choice') {
              // For choice questions, include options and ans
              return {
                id: question.id,
                ans: question.ans,
                options: question.options
              };
            }
            
            // Fallback (shouldn't happen if all questions are properly typed)
            return question;
          })
        };
      }),
      total_amount: calculateTotalPrice(),
      price_plan: state.selectedServices[0]?.selectedPricingOption || 0
    };

    // Save to backend
    const response = await axiosInstance.post('/data/purchase/', quoteData);
    const quoteId = response.data.id;

    // Navigate to review page with quote ID
    navigate(`/user/review/${quoteId}`);
  } catch (error) {
    console.error('Error saving quote:', error);
    // Handle error (show toast/message)
  } finally {
    setIsSubmitting(false);
  }
};


  // Get pricing option for a specific service
  const getPricingOptionForService = (service, selectedPricingOptionId) => {
    if (!selectedPricingOptionId) return null
    
    // First check if service has its own pricing options
    if (service.pricingOptions && service.pricingOptions.length > 0) {
      return service.pricingOptions.find(option => option.id === selectedPricingOptionId)
    }
    
    // Otherwise check default settings
    return settings.pricingOptions?.find(option => option.id === selectedPricingOptionId)
  }

  // Calculate total price with all service pricing options applied
const calculateTotalPrice = () => {
  return state.selectedServices.reduce((total, serviceItem) => {
    const pricingOption = getPricingOptionForService(serviceItem.service, serviceItem.selectedPricingOption);
    const serviceBasePrice = typeof serviceItem.calculatedPrice === 'object' 
      ? serviceItem.calculatedPrice.total 
      : serviceItem.calculatedPrice || 0;
    
    if (pricingOption && pricingOption.discount > 0) {
      return total + applyPricingOption(serviceBasePrice, pricingOption.discount);
    }
    
    return total + serviceBasePrice;
  }, 0);
};

  const getServiceBasePrice = (serviceItem) => {
    return typeof serviceItem.calculatedPrice === 'object'
      ? serviceItem.calculatedPrice.total
      : serviceItem.calculatedPrice
  }

  const totalPrice = calculateTotalPrice()
  const baseTotal = state.selectedServices.reduce((total, service) => 
    total + getServiceBasePrice(service), 0)
  const totalSavings = baseTotal - totalPrice

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800">Quote Summary</h3>
        <p className="text-gray-600">Review your selected services</p>
      </div>

      {/* Selected Services */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Selected Services:</h4>
        {state.selectedServices.map((item, index) => {
          const pricingOption = getPricingOptionForService(item.service, item.selectedPricingOption)
          const serviceBasePrice = getServiceBasePrice(item)
          const servicePrice = pricingOption && pricingOption.discount > 0 
            ? applyPricingOption(serviceBasePrice, pricingOption.discount)
            : serviceBasePrice
          const serviceSavings = serviceBasePrice - servicePrice
          const priceBreakdown = item.calculatedPrice?.breakdown

          return (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">{item.service.name}</p>
                  <p className="text-sm text-gray-600">{item.service.description}</p>
                  
                  {/* Show selected pricing plan for this service */}
                  {pricingOption && (
                    <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                      <p className="font-medium text-blue-800">Plan: {pricingOption.name}</p>
                      {pricingOption.discount > 0 && (
                        <p className="text-blue-600">
                          {pricingOption.discount}% discount • Save {formatCurrency(serviceSavings)}
                        </p>
                      )}
                      {pricingOption.pricing_type && (
                        <p className="text-blue-600 capitalize text-xs">
                          {pricingOption.pricing_type} billing
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Price breakdown details */}
                  {priceBreakdown && (
                    <div className="mt-3 border-t pt-2 text-sm">
                      <p className="font-medium text-gray-700">Price Calculation:</p>
                      
                      <div className="ml-2 mt-1 space-y-1">
                        {priceBreakdown.optionPrices.length > 0 && (
                          <>
                            <p className="text-xs text-gray-500 font-medium">Selected Options:</p>
                            {priceBreakdown.optionPrices.map((option, idx) => (
                              <div key={idx} className="flex justify-between text-gray-600">
                                <span>{option.optionName} ({formatCurrency(option.unitPrice)} × {option.quantity}):</span>
                                <span>{formatCurrency(option.total)}</span>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {priceBreakdown.booleanPrices.length > 0 && (
                          <>
                            <p className="text-xs text-gray-500 font-medium mt-2">Additional Options:</p>
                            {priceBreakdown.booleanPrices.map((option, idx) => (
                              <div key={idx} className="flex justify-between text-gray-600">
                                <span>{option.questionText}:</span>
                                <span>{formatCurrency(option.price)}</span>
                              </div>
                            ))}
                          </>
                        )}
                        
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-medium text-gray-700">
                            <span>Subtotal (before discount):</span>
                            <span>{formatCurrency(serviceBasePrice)}</span>
                          </div>
                          {pricingOption && pricingOption.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount ({pricingOption.discount}%):</span>
                              <span>-{formatCurrency(serviceSavings)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  {pricingOption && pricingOption.discount > 0 ? (
                    <div>
                      <p className="font-medium text-gray-700">{formatCurrency(servicePrice)}</p>
                      <p className="text-sm text-gray-500 line-through">{formatCurrency(serviceBasePrice)}</p>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-700">{formatCurrency(servicePrice)}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Savings */}
      {totalSavings > 0 && (
        <div className="border p-4 rounded-lg bg-green-50">
          <h4 className="font-semibold text-gray-700 mb-2">Total Savings Applied:</h4>
          <p className="text-green-600 font-medium">
            You're saving {formatCurrency(totalSavings)} with your selected plans!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Original total: {formatCurrency(baseTotal)} → Final total: {formatCurrency(totalPrice)}
          </p>
        </div>
      )}

      {/* Total Price */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-gray-800">Total Price:</p>
            {totalSavings > 0 && (
              <p className="text-sm text-gray-500 line-through">
                Original: {formatCurrency(baseTotal)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrice)}</p>
            {totalSavings > 0 && (
              <p className="text-sm text-green-600">You save {formatCurrency(totalSavings)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 space-x-4">
        <button
          onClick={handleAddMoreServices}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Add More Services
        </button>
        <button
          onClick={handleFinalize}
          disabled={isSubmitting}
          className={`px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Finalize Quote'}
        </button>
      </div>
    </div>
  )
}

export default Summary