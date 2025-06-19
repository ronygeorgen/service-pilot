"use client"

import { useQuote } from "../../context/QuoteContext"
import { useSelector } from "react-redux"
import { useState } from "react"
import CreateCustomServiceModal from "./CreateCustomServiceModal"

const ServiceSelection = ({ services = [] }) => {
  const { dispatch } = useQuote()
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false)
  const { selectedServices } = useSelector((state) => state.services)

  const handleServiceSelect = (service) => {
    dispatch({ type: "SELECT_SERVICE", payload: service })
  }

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes('window')) return '🪟'
    if (name.includes('gutter')) return '🏠'
    if (name.includes('pressure') || name.includes('wash')) return '💧'
    if (name.includes('roof')) return '🏘️'
    if (name.includes('car')) return '🚗'
    return '🛠️'
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading services...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Service</h3>
        <p className="text-gray-600">Choose the service you'd like to get a quote for</p>
      </div>

      {/* Add Custom Service Button */}
      <button
        onClick={() => setShowCustomServiceModal(true)}
        className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
      >
        <div className="flex items-start space-x-4">
          <div className="text-2xl">✏️</div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Create Custom Service</h4>
            <p className="text-sm text-gray-600 mb-2">
              Add a service that's not in our standard offerings
            </p>
          </div>
        </div>
      </button>
      
      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{getServiceIcon(service.name)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    Starting at ${service.minimum_price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {service.description || `Get a personalized quote for ${service.name.toLowerCase()}`}
                </p>
                
                {/* Features Preview */}
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature.id}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {feature.name}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Questions Preview */}
                {service.questions && service.questions.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      {service.questions.length} question{service.questions.length !== 1 ? 's' : ''} to answer
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Service Modal */}
      {showCustomServiceModal && (
        <CreateCustomServiceModal 
          onClose={() => setShowCustomServiceModal(false)} 
        />
      )}
    </div>
  )
}

export default ServiceSelection