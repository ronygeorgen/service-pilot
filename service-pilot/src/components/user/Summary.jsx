"use client"

import { useState } from "react"
import { useQuote } from "../../context/QuoteContext"
import { formatCurrency, applyPricingOption, calculateSavings } from "../../utils/calculations"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux' 
import { axiosInstance } from "../../services/api"
import CreateCustomServiceModal from "./CreateCustomServiceModal"

const Summary = () => {
  const { state, settings, dispatch } = useQuote()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { selectedContact } = useSelector((state) => state.contacts)
  const queryParams = new URLSearchParams(window.location.search);
  const locationId = queryParams.get('location');
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);

  const handleAddMoreServices = () => {
    dispatch({ type: "ADD_MORE_SERVICES" })
  }

  // console.log('selected service details in summary page==', state.selectedServices)


// Update the handleFinalize function to handle extra_choice type
const handleFinalize = async () => {

  
  setIsSubmitting(true);
  try {
    const { adjustedPrice: totalAmount } = calculateTotalPrice();
    
    const quoteData = {
      contact: selectedContact.contact_id,
      custom_products: state.selectedServices
        .filter(service => service.service.is_custom)
        .map(service => ({
          product_name: service.service.name,
          description: service.service.description,
          price: service.calculatedPrice,
          is_custom: true,
        })),
      services: state.selectedServices.filter(service => !service.service.is_custom).map(service => {

        // if (service.service.is_custom) {
        //   return {
        //     // id: service.service.id,
        //     product_name: service.service.name,
        //     description: service.service.description,
        //     price: service.calculatedPrice,
        //     is_custom: true,
        //   };
        // }
        if (!service.service.is_custom){

          const answersByQuestion = {};
          
          Object.entries(service.answers).forEach(([key, value]) => {
            // Handle extra_choice type (single value per question)
            const serviceQuestion = service.service.questions.find(q => 
              q.id.toString() === key || key.startsWith(q.id.toString() + '-')
            );
            
            if (serviceQuestion?.type === 'extra_choice') {
              answersByQuestion[key] = {
                id: parseInt(key),
                ans: value === 'Yes',
                selectedOption: value // Store the selected option label
              };
            } 
            // Rest of the existing logic for other types...
            else {
              const [questionId, optionLabel] = key.split('-');
              
              if (!answersByQuestion[questionId]) {
                answersByQuestion[questionId] = {
                  id: parseInt(questionId),
                  options: {},
                  ans: false
                };
              }
              
              if (value === 'Yes' || value === 'No') {
                answersByQuestion[questionId].ans = value === 'Yes';
              } else if (optionLabel) {
                answersByQuestion[questionId].options[optionLabel.toLowerCase()] = parseInt(value) || 0;
              }
            }
  
          });
          
          return {
            id: service.service.id,
            price_plan: service.selectedPricingOption || 0,
            questions: Object.values(answersByQuestion).map(question => {
              const serviceQuestion = service.service.questions.find(q => q.id === question.id);
              
              if (serviceQuestion?.type === 'boolean') {
                return { id: question.id, ans: question.ans };
              } 
              else if (serviceQuestion?.type === 'extra_choice') {
                return {
                  id: question.id,
                  ans: question.ans,
                  options: {
                    [question.selectedOption]: 0
                  }
                };
              }
              else if (serviceQuestion?.type === 'choice') {
                return {
                  id: question.id,
                  ans: question.ans,
                  options: question.options
                };
              }
              
              return question;
            })
          };

        }
      }),
      total_amount: totalAmount.toFixed(2),
      price_plan: state.selectedServices[0]?.selectedPricingOption || 0
    };

    const response = await axiosInstance.post('/data/purchase/', quoteData);
    navigate(`/user/review/${response.data.id}${locationId ? `?location=${locationId}` : ''}`);
  } catch (error) {
    console.error('Error saving quote:', error);
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
  // Separate regular services and custom products
  const regularServices = state.selectedServices.filter(service => !service.service.is_custom);
  const customProducts = state.selectedServices.filter(service => service.service.is_custom);

  // Calculate regular services total (minimum price applies here)
  const regularServicesTotal = regularServices.reduce((total, serviceItem) => {
    const pricingOption = getPricingOptionForService(serviceItem.service, serviceItem.selectedPricingOption);
    const serviceBasePrice = typeof serviceItem.calculatedPrice === 'object' 
      ? serviceItem.calculatedPrice.total 
      : serviceItem.calculatedPrice || 0;
    
    if (pricingOption && pricingOption.discount > 0) {
      return total + applyPricingOption(serviceBasePrice, pricingOption.discount);
    }
    return total + serviceBasePrice;
  }, 0);

  // Calculate custom products total (no minimum price applies)
  const customProductsTotal = customProducts.reduce((total, productItem) => {
    return total + (productItem.calculatedPrice || 0);
  }, 0);

  // Find highest minimum price among regular services only
  const highestMinimumPrice = regularServices.reduce((max, serviceItem) => {
    const serviceMinPrice = serviceItem.service.minimum_price || 0;
    return Math.max(max, serviceMinPrice);
  }, 0);

  // Apply minimum price only to regular services portion
  const adjustedRegularServicesTotal = Math.max(regularServicesTotal, highestMinimumPrice);
  
  // Combine with custom products (no minimum applies)
  const total = adjustedRegularServicesTotal + customProductsTotal;

  return {
    adjustedPrice: total,
    isMinimumPriceApplied: regularServicesTotal < highestMinimumPrice
  };
};

  const getServiceBasePrice = (serviceItem) => {
    if (serviceItem.service.is_custom) {
      return serviceItem.calculatedPrice;
    }
    return typeof serviceItem.calculatedPrice === 'object'
      ? serviceItem.calculatedPrice.total
      : serviceItem.calculatedPrice
  }

const { adjustedPrice: totalPrice, isMinimumPriceApplied } = calculateTotalPrice();

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
          const isCustom = item.service.is_custom;
          const pricingOption = isCustom ? null : getPricingOptionForService(item.service, item.selectedPricingOption);
          const serviceBasePrice = getServiceBasePrice(item)
          const servicePrice = isCustom ? serviceBasePrice : 
            (pricingOption && pricingOption.discount > 0 
              ? applyPricingOption(serviceBasePrice, pricingOption.discount)
              : serviceBasePrice);
          const serviceSavings = isCustom ? 0 : serviceBasePrice - servicePrice;
          const priceBreakdown = isCustom ? null : item.calculatedPrice?.breakdown;

          return (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">{item.service.name}</p>
                  {isCustom && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>}
                  <p className="text-sm text-gray-600">{item.service.description}</p>
                  
                  {/* Show selected pricing plan for this service */}
                  {isCustom ? (
                    <div className="mt-3 border-t pt-2 text-sm">
                      <p className="font-medium text-gray-700">Price: {formatCurrency(servicePrice)}</p>
                    </div>
                  ) : (
                    <>
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
                  </>
                  )}
                </div>
                <div className="text-right ml-4">
                  {pricingOption && pricingOption.discount > 0 ? (
                    <div>
                      <p className="font-medium text-gray-700">{formatCurrency(servicePrice)}</p>
                      <div className="text-gray-500 text-xs mb-3">Plus Tax</div>
                      {/* <p className="text-sm text-gray-500 line-through">{formatCurrency(serviceBasePrice)}</p> */}
                      {!isCustom && pricingOption && pricingOption.discount > 0 && (
                        <p className="text-sm text-gray-500 line-through">{formatCurrency(serviceBasePrice)}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                    <p className="font-medium text-gray-700">{formatCurrency(servicePrice)}</p>
                    <div className="text-gray-500 text-xs mb-3">Plus Tax</div>
                    </div>
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
      {/* Total Price */}
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
      {/* Add note when minimum price is applied */}
      {isMinimumPriceApplied && (
        <p className="text-sm text-blue-600 mt-1">
          Note: The total has been adjusted to meet the minimum price requirement of {formatCurrency(totalPrice)} for the selected services.
        </p>
      )}
    </div>
    <div className="text-right">
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrice)}</p>
      <div className="text-gray-500 text-md mb-3">Plus Tax (8.25%)</div>
      {totalSavings > 0 && (
        <p className="text-sm text-green-600">You save {formatCurrency(totalSavings)}</p>
      )}
    </div>
  </div>
</div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 space-x-4">
        <div className="space-x-4">
          <button
            onClick={() => setShowCustomServiceModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            +Create a Custom Service
          </button>
          <button
            onClick={handleAddMoreServices}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Add More Services
          </button>
        </div>
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
      {showCustomServiceModal && (
        <CreateCustomServiceModal onClose={() => setShowCustomServiceModal(false)} />
      )}
    </div>
  )
}

export default Summary