"use client"
import { useQuote } from "../../context/QuoteContext"
import { formatCurrency, applyPricingOption, calculateSavings } from "../../utils/calculations"

const PricingOptions = () => {
  const { state, settings, dispatch } = useQuote()

  const handlePricingSelect = (optionId) => {
    dispatch({ type: "SELECT_PRICING_OPTION", payload: optionId })
  }

  const handleGoBack = () => {
    dispatch({ type: "GO_BACK_TO_QUESTIONS" })
  }

  const handleContinue = () => {
    if (state.selectedPricingOption) {
      dispatch({ type: "SHOW_SUMMARY" })
    }
  }

  const getBasePrice = () => {
    return state.selectedServices.reduce((total, service) => {
      // Handle both old format and new format
      const servicePrice = typeof service.calculatedPrice === 'object' 
        ? service.calculatedPrice.total 
        : service.calculatedPrice
      return total + servicePrice
    }, 0)
  }

  const getCurrentService = () => {
    return state.selectedServices[state.selectedServices.length - 1]?.service
  }

  const getPricingOptions = () => {
    const currentService = getCurrentService()
    if (currentService?.pricingOptions && currentService.pricingOptions.length > 0) {
      return currentService.pricingOptions
    }
    return settings.pricingOptions || []
  }

  const basePrice = getBasePrice()
  const pricingOptions = getPricingOptions()
  
  // Get the current calculated price details
  const currentServiceData = state.selectedServices[state.selectedServices.length - 1]
  const priceBreakdown = currentServiceData?.calculatedPrice?.breakdown

  // DEBUG: Log the current state
  console.log('PricingOptions render - Current state:', {
    basePrice,
    currentServiceData,
    priceBreakdown,
    selectedServices: state.selectedServices,
    answers: state.answers
  })

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
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Go Back
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

     

      {/* Price breakdown section */}
      {priceBreakdown && (
        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Price Calculation Details</h4>
          
          <div className="space-y-2 text-sm">
            {/* Selected Options (choice/number questions) */}
            {priceBreakdown.optionPrices && priceBreakdown.optionPrices.length > 0 && (
              <div>
                <p className="font-medium mb-1">Selected Options:</p>
                {priceBreakdown.optionPrices.map((option, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 pl-2">
                    <span>{option.optionName} ({formatCurrency(option.unitPrice)} × {option.quantity}):</span>
                    <span>{formatCurrency(option.total)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Boolean Questions (Yes/No questions with pricing) */}
            {priceBreakdown.booleanPrices && priceBreakdown.booleanPrices.length > 0 && (
              <div className={priceBreakdown.optionPrices?.length > 0 ? "border-t pt-2" : ""}>
                <p className="font-medium mb-1">Additional Options (with charges):</p>
                {priceBreakdown.booleanPrices.map((option, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 pl-2">
                    <span>{option.questionText}:</span>
                    <span>{formatCurrency(option.price)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Selected Answers (including zero-cost options) */}
            {priceBreakdown.selectedAnswers && priceBreakdown.selectedAnswers.length > 0 && (
              <div className={(priceBreakdown.optionPrices?.length > 0 || priceBreakdown.booleanPrices?.length > 0) ? "border-t pt-2" : ""}>
                <p className="font-medium mb-1">Selected Additional Options:</p>
                {priceBreakdown.selectedAnswers.map((option, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 pl-2">
                    <span>{option.questionText} ({option.answer}):</span>
                    <span className={option.hasCharge ? "" : "text-green-600"}>
                      {option.hasCharge ? formatCurrency(option.price) : "Included"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show if there are no options or boolean prices */}
            {(!priceBreakdown.optionPrices || priceBreakdown.optionPrices.length === 0) && 
             (!priceBreakdown.booleanPrices || priceBreakdown.booleanPrices.length === 0) &&
             (!priceBreakdown.selectedAnswers || priceBreakdown.selectedAnswers.length === 0) && (
              <div className="text-gray-500 text-center py-4">
                No itemized charges (all questions had $0 pricing)
              </div>
            )}
            
            <div className="border-t pt-2 font-medium">
              <div className="flex justify-between">
                <span>Base Total (before discount):</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pricingOptions.map((option) => {
          const discountedPrice = applyPricingOption(basePrice, option.discount)
          const savings = calculateSavings(basePrice, option.discount)
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
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
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
              {/* Included features */}
              {option.selectedFeatures?.length > 0 && (
                <div className="mt-2 ml-6">
                  <p className="text-xs text-gray-500 mb-1">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {option.selectedFeatures.map((feature) => (
                      <span
                        key={feature.id}
                        className={`text-xs px-2 py-0.5 rounded ${
                          feature.is_included 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {feature.is_included ? "✓" : "○"} Feature {feature.id}
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
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!state.selectedPricingOption}
          className={`px-6 py-2 rounded-md text-white ${state.selectedPricingOption ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default PricingOptions