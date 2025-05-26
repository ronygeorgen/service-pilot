"use client"

import { useState } from "react"
import { LogOut, User } from "lucide-react"
import QuoteWidget from "./QuoteWidget"

const Home = () => {
  const [user] = useState({ name: "John Doe", email: "john@example.com" })

  const services = [
    {
      id: "window-cleaning",
      name: "Window Cleaning",
      description: "Professional window cleaning services for residential and commercial properties",
      icon: "🪟",
      price: "Starting at $125",
    },
    {
      id: "gutter-cleaning",
      name: "Gutter Cleaning",
      description: "Complete gutter cleaning and maintenance services",
      icon: "🏠",
      price: "Starting at $150",
    },
    {
      id: "pressure-washing",
      name: "Pressure Washing",
      description: "High-quality pressure washing for driveways, sidewalks, and exteriors",
      icon: "💧",
      price: "Starting at $200",
    },
    {
      id: "roof-cleaning",
      name: "Roof Cleaning",
      description: "Safe and effective roof cleaning to maintain your property",
      icon: "🏘️",
      price: "Starting at $300",
    },
  ]

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...")
    // For example: redirect to login page, clear tokens, etc.
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ServicePro</h1>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
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

// Service Card Component
const ServiceCard = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{service.icon}</span>
          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">{service.price}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Learn More
          </button>
          <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
            Get Quote
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
