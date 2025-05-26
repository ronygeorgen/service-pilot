"use client"
import { useQuote } from "../../context/QuoteContext"

const ServiceSelection = () => {
  const { settings, dispatch } = useQuote()

  const handleServiceSelect = (service) => {
    dispatch({ type: "SELECT_SERVICE", payload: service })
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Service</h3>
        <p className="text-gray-600">Choose the service you'd like to get a quote for</p>
      </div>

      <div className="space-y-3">
        {settings.services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <h4 className="font-medium text-gray-900">{service.name}</h4>
            <p className="text-sm text-gray-600 mt-1">Get a personalized quote for {service.name.toLowerCase()}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ServiceSelection
