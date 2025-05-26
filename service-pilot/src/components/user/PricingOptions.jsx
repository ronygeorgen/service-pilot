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

  const getBasePrice = () => {
    return state.selectedServices.reduce((total, service) => total + service.calculatedPrice, 0)
  }

  const basePrice = getBasePrice()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Service Plan</h3>
        <p className="text-gray-600">Select how often you'd like this service</p>
      </div>

      <div className="space-y-4">
        {settings.pricingOptions.map((option) => {
          const discountedPrice = applyPricingOption(basePrice, option.discount)
          const savings = basePrice - discountedPrice

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                state.selectedPricingOption === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handlePricingSelect(option.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{option.name}</h4>
                  {option.discount > 0 && (
                    <p className="text-sm text-green-600">
                      Save {option.discount}% ({formatCurrency(savings)})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(discountedPrice)}</div>
                  {option.discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">{formatCurrency(basePrice)}</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleAddMoreServices}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Add More Services
        </button>
        <button
          disabled={!state.selectedPricingOption}
          className={`px-6 py-2 rounded-md text-white ${
            state.selectedPricingOption ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default PricingOptions
