"use client"
import { useQuote } from "../../context/QuoteContext"
import { formatCurrency, applyPricingOption } from "../../utils/calculations"

const PricingOptions = () => {
  const { state, settings, dispatch } = useQuote()

  const handlePricingSelect = (optionId) => {
    dispatch({ type: "SELECT_PRICING_OPTION", payload: optionId })
  }

  const handleAddMoreServices = () => {
    dispatch({ type: "ADD_MORE_SERVICES" })
  }

  const handleContinue = () => {
    // Handle the continue action - you can dispatch an action or call a callback
    console.log("Continue with selected pricing option:", state.selectedPricingOption)
    // You might want to dispatch an action to proceed to the next step
    // dispatch({ type: "PROCEED_TO_NEXT_STEP" })
  }

  const getBasePrice = () => {
    return state.selectedServices.reduce((total, service) => total + service.calculatedPrice, 0)
  }

  const getCurrentService = () => {
    return state.selectedServices[state.selectedServices.length - 1]?.service
  }

  const getPricingOptions = () => {
    const currentService = getCurrentService()
    
    // Use service-specific pricing options if available, otherwise use default settings
    if (currentService?.pricingOptions && currentService.pricingOptions.length > 0) {
      return currentService.pricingOptions
    }
    
    return settings.pricingOptions || []
  }

  const basePrice = getBasePrice()
  const pricingOptions = getPricingOptions()

  if (pricingOptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Service Quote</h3>
          <p className="text-gray-600">Your estimated price</p>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(basePrice)}</div>
            <p className="text-sm text-gray-600 mt-1">Total Price</p>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={handleAddMoreServices}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Add More Services
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Service Plan</h3>
        <p className="text-gray-600">Select how often you'd like this service</p>
      </div>

      <div className="space-y-4">
        {pricingOptions.map((option) => {
          const discountedPrice = applyPricingOption(basePrice, option.discount)
          const savings = basePrice - discountedPrice
          const isSelected = state.selectedPricingOption === option.id

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
              onClick={() => handlePricingSelect(option.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {option.name}
                    </h4>
                  </div>
                  {option.discount > 0 && (
                    <p className="text-sm text-green-600 ml-6">
                      Save {option.discount}% ({formatCurrency(savings)})
                    </p>
                  )}
                  {option.pricing_type && (
                    <p className="text-xs text-gray-500 ml-6 capitalize">
                      {option.pricing_type} billing
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(discountedPrice)}
                  </div>
                  {option.discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(basePrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Show included features if available */}
              {option.selectedFeatures && option.selectedFeatures.length > 0 && (
                <div className="mt-2 ml-6">
                  <p className="text-xs text-gray-500 mb-1">Included features:</p>
                  <div className="flex flex-wrap gap-1">
                    {option.selectedFeatures
                      .filter(feature => feature.is_included)
                      .map((feature) => (
                        <span
                          key={feature.id}
                          className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                        >
                          ✓ Feature {feature.id}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleAddMoreServices}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Add More Services
        </button>
        <button
          onClick={handleContinue}
          disabled={!state.selectedPricingOption}
          className={`px-6 py-2 rounded-md text-white transition-colors ${
            state.selectedPricingOption 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default PricingOptions