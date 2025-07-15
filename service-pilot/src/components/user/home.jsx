"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { LogOut, User } from "lucide-react"
import { fetchServices } from "../../features/user/servicesSlice"
import QuoteWidget from "./QuoteWidget"
import { useNavigate } from "react-router-dom"
import { useParams } from 'react-router-dom';
import { getServiceIcon } from "../../utils/serviceIcons";


const Home = () => {
  const dispatch = useDispatch()
  const { services, loading, error } = useSelector((state) => state.services)
  const [user] = useState({ name: "John Doe", email: "john@example.com" })
  const navigate = useNavigate()

  const queryParams = new URLSearchParams(window.location.search);
  
  const locationId = queryParams.get('location');
  const isSpecialLocation = locationId === 'b8qvo7VooP3JD3dIZU42';

  useEffect(() => {
    dispatch(fetchServices())
  }, [dispatch])

  const handleLogout = () => {
    console.log("Logging out...")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading services: {error}</p>
          <button
            onClick={() => dispatch(fetchServices())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ServiceCard component (now using the imported getServiceIcon)
  const ServiceCard = ({ service }) => {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={getServiceIcon(service.name)} // Using the utility function
                alt={service.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
              Starting at ${service.minimum_price}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {service.description || `Get a personalized quote for ${service.name.toLowerCase()}`}
          </p>

          {service.features && service.features.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Features:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {service.features.slice(0, 2).map((feature) => (
                  <li key={feature.id} className="flex items-center">
                    <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                    {feature.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Choose from our professional services below</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Need a Custom Quote?</h3>
          <p className="text-blue-700 mb-4">
            Get personalized pricing for your specific needs. Our quote system will help you get accurate estimates.
          </p>
          <div className="text-sm text-blue-600">
            <p>✓ Instant online quotes</p>
            <p>✓ No hidden fees</p>
            <p>✓ Professional service guaranteed</p>
          </div>
        </div>
      </main>

      {/* Quote Widget */}
      <QuoteWidget buttonText="Get Quote" primaryColor="#2563EB" secondaryColor="#10B981" />
    </div>
  )
}


export default Home