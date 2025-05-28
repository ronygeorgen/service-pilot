"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Check, X, ChevronRight, ChevronUp, ChevronDown, FileText } from "lucide-react"
import { useQuote } from "../../context/QuoteContext"
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux' 

export default function WindowCleaningQuote() {
  const { selectedContact } = useSelector((state) => state.contacts)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState("about")
  const { state } = useQuote()
  const location = useLocation()
  const { totalPrice : tt, totalSavings, selectedServices } = location.state || {}
  console.log('finalized quote ================================', totalSavings, selectedServices);

  const [expandedSections, setExpandedSections] = useState({
    note: false,
    photos: false,
  })
  const [signature, setSignature] = useState("")
  const scrollRef = useRef(null)
  const [selectedPlans, setSelectedPlans] = useState({}) // Track selected plan for each service

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  };

  // Calculate the total price for each pricing option
  const calculatePlanPrice = (pricingOption, optionPrices, booleanPrices) => {
  // Calculate total from option prices (choice/number questions)
  const optionsTotal = optionPrices.reduce((sum, option) => sum + option.total, 0)
  
  // Calculate total from boolean questions
  const booleanTotal = booleanPrices.reduce((sum, boolPrice) => sum + boolPrice.price, 0)
  
  // Combine both totals
  const baseTotal = optionsTotal + booleanTotal
  
  const discount = pricingOption.discount || 0
  const discountedPrice = baseTotal * (1 - discount / 100)
  
  return {
    basePrice: baseTotal,
    discountedPrice: discountedPrice,
    savings: baseTotal - discountedPrice
  }
}

  // Generate plans for a service
const generatePlans = (service) => {
  if (!service.service?.pricingOptions) return []
  
  const optionPrices = service.calculatedPrice?.breakdown?.optionPrices || []
  const booleanPrices = service.calculatedPrice?.breakdown?.booleanPrices || []
  
  return service.service.pricingOptions.map(option => {
    const priceInfo = calculatePlanPrice(option, optionPrices, booleanPrices)
    
    return {
      id: option.id.toString(),
      name: option.name.charAt(0).toUpperCase() + option.name.slice(1),
      basePrice: priceInfo.basePrice,
      price: priceInfo.discountedPrice,
      savings: priceInfo.savings,
      discount: option.discount,
      features: option.selectedFeatures || []
    }
  })
}

  // Initialize selected plans
  useEffect(() => {
    const initialSelectedPlans = {}
    selectedServices?.forEach(service => {
      const plans = generatePlans(service)
      if (plans.length > 0) {
        initialSelectedPlans[service.service.id] = service.selectedPricingOption?.toString() || plans[0].id
      }
    })
    setSelectedPlans(initialSelectedPlans)
  }, [selectedServices])

  const steps = [
    { id: 0, color: "bg-blue-500" },
    { id: 1, color: "bg-blue-500" },
    { id: 2, color: "bg-green-500" },
    { id: 3, color: "bg-gray-400" },
  ]

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const scrollPlans = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Calculate total price across all services
  const calculateTotalPrice = () => {
    return selectedServices?.reduce((total, service) => {
      const plans = generatePlans(service)
      const selectedPlanId = selectedPlans[service.service.id]
      const selectedPlan = plans.find(plan => plan.id === selectedPlanId)
      return total + (selectedPlan?.price || 0)
    }, 0) || 0
  }

  const totalPrice = calculateTotalPrice()

  return (
    <div className="min-h-screen bg-gray-200 pb-20">
      {/* Header Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 pt-6 pb-4">
        <div className="text-center px-4">
          <div className="mb-6">
            <img src="/placeholder.svg?height=120&width=120" alt="Tru Shine Logo" className="mx-auto h-16 w-16" />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">PREPARED FOR:</h2>
            {selectedContact ? (
              <>
                <p className="text-base font-medium">
                  {selectedContact.first_name} {selectedContact.last_name}
                </p>
                {selectedContact.phone && (
                  <p className="text-gray-600 text-sm">
                    Phone: {formatPhoneNumber(selectedContact.phone)}
                  </p>
                )}
                {selectedContact.email && (
                  <p className="text-gray-600 text-sm">
                    Email: {selectedContact.email}
                  </p>
                )}
              </>
            ) : (
              <p className="text-base font-medium">No contact selected</p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Which of These Services Would You Like?</h3>
            <p className="text-gray-600 mb-2 text-sm">
              The prices shown are quotes based on the info you gave us, but will need to be confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Loop through each service */}
      {selectedServices?.map((service, serviceIndex) => {
        const serviceDetails = service?.service || {}
        const plans = generatePlans(service)
        const selectedPlanId = selectedPlans[serviceDetails.id]
        const selectedPlanData = plans.find(plan => plan.id === selectedPlanId)
        const answers = service?.answers || {}

        return (
          <div key={serviceIndex} className="mb-8">
            {/* Service Video Section */}
            <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
              <div className="px-4">
                <h3 className="text-xl font-semibold text-center mb-2">{serviceDetails.name || "Service"}</h3>
                <p className="text-center text-gray-600 text-sm mb-4">Watch on YouTube</p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-2xl mx-auto">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/4l8fti9xYdc"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Details and Pricing Section */}
            <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
              <div className="px-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Details</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {serviceDetails.description || "No description available"}
                  </p>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-2">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`w-2.5 h-2.5 rounded-full ${index === 2 ? "bg-green-500" : "bg-blue-500"}`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Pricing Plans */}
                <div className="relative mb-6">
                  <div 
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4"
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      justifyContent: 'center'
                    }}
                  >
                    {plans.map((plan) => {
                      const planFeatures = serviceDetails.features?.map(feature => {
                        const isIncluded = plan.features.some(
                          pf => pf.id === feature.id && pf.is_included
                        )
                        return {
                          name: feature.name,
                          included: isIncluded
                        }
                      }) || []

                      return (
                        <div key={plan.id} className="bg-white border rounded-lg overflow-hidden flex-shrink-0 w-72">
                          <div className={`${selectedPlanId === plan.id ? "bg-green-500" : "bg-blue-400"} text-white text-center py-3`}>
                            <h4 className="text-base font-semibold">{plan.name}</h4>
                            {plan.discount > 0 && (
                              <p className="text-xs mt-1">Save {plan.discount}%</p>
                            )}
                          </div>

                          <div className="p-4">
                            <ul className="space-y-2 mb-4">
                              {planFeatures.map((feature, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  {feature.included ? (
                                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs ${feature.included ? "text-gray-800" : "text-gray-400"}`}>
                                    {feature.name}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            <div className="text-center">
                              {plan.discount > 0 && (
                                <div className="text-gray-500 text-sm line-through mb-1">${plan.basePrice.toFixed(2)}</div>
                              )}
                              <div className="text-xl font-bold mb-1">${plan.price.toFixed(2)}</div>
                              {plan.discount > 0 && (
                                <div className="text-green-500 text-xs mb-1">Save ${plan.savings.toFixed(2)}</div>
                              )}
                              <div className="text-gray-500 text-xs mb-3">Plus Tax</div>

                              <button
                                onClick={() => {
                                  setSelectedPlans(prev => ({
                                    ...prev,
                                    [serviceDetails.id]: plan.id
                                  }))
                                }}
                                className={`w-full py-2 px-4 rounded flex items-center justify-center text-sm ${
                                  selectedPlanId === plan.id
                                    ? "bg-green-500 text-white"
                                    : "bg-blue-400 text-white hover:bg-blue-500"
                                }`}
                              >
                                {selectedPlanId === plan.id ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Selected
                                  </>
                                ) : (
                                  "Select"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Learn More Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="px-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-3">Learn more about us!</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Below is some information about our company, along with an overview of the information you provided during
              the quoting process.
            </p>
            <a href="#" className="text-blue-500 hover:underline flex items-center justify-center space-x-2 text-sm">
              <FileText className="w-4 h-4 text-red-500" />
              <span>Download PDF</span>
            </a>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "about" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                About Company
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "specs" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Job Specs
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "about" && (
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <img src="/placeholder.svg?height=150&width=150" alt="Company Logo" className="h-24 w-24" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 leading-relaxed text-sm">
                  Thanks for taking the time to fill out our instant online bid. We know your time is valuable and our
                  instant online bid feature is just one way we help to accommodate your schedule. Whether it is getting
                  the bid done for you quickly or getting your windows cleaned right the first time, we have built our
                  business in a way to prove to you that we are serious about your satisfaction in every way possible!
                </p>
                <p className="text-gray-600 mt-3 text-sm">- Arman K</p>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Selected Services</h4>
              {selectedServices?.map((service, index) => {
                const serviceDetails = service?.service || {}
                const answers = service?.answers || {}
                
                return (
                  <div key={index} className="mb-6">
                    <h5 className="font-medium mb-3">{serviceDetails.name}</h5>
                    <div className="space-y-3">
                      {Object.entries(answers).map(([key, value]) => {
                        // Find the corresponding question in the service's questions array
                        const questionId = key.split('-')[0]; // Get the base ID (removes option suffix)
                        const question = serviceDetails.questions?.find(q => q.id.toString() === questionId);
                        
                        // For boolean questions, use the question text directly
                        if (question?.type === "boolean") {
                          return (
                            <div key={key} className="flex justify-between border-b pb-2">
                              <span className="text-gray-600">{question.text}:</span>
                              <span className="font-medium">
                                {value === "Yes" ? "Yes" : "No"}
                              </span>
                            </div>
                          );
                        }
                        
                        // For choice/number questions with options
                        const optionLabel = key.split('-')[1]; // Get the option label if exists
                        let displayText = question?.text || key;
                        
                        // If it's an option, append the option label to the question text
                        if (optionLabel && question) {
                          displayText = `${optionLabel}`;
                        } else if (question) {
                          displayText = question.text;
                        }

                        return (
                          <div key={key} className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">{displayText}:</span>
                            <span className="font-medium">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-3">Disclaimer</h4>
            <div className="text-xs text-gray-600 space-y-3">
              {/* Disclaimer content remains the same */}
            </div>
          </div>
        </div>
      </div>

      {/* Final Booking Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="px-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4 text-sm">
              Please review the details below to confirm that we got everything right, and then we'll go ahead and book
              you in.
            </p>

            <h3 className="text-lg font-semibold mb-4">You've chosen the following services:</h3>

            {selectedServices?.map((service, index) => {
              const serviceDetails = service?.service || {}
              const plans = generatePlans(service)
              const selectedPlanId = selectedPlans[serviceDetails.id]
              const selectedPlan = plans.find(plan => plan.id === selectedPlanId)

              return (
                <div key={index} className="flex justify-between items-center py-3 border-b">
                  <div className="text-left">
                    <span className="text-blue-500 font-medium text-sm">
                      {serviceDetails.name?.toUpperCase()} ({selectedPlan?.name?.toUpperCase()})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">${selectedPlan?.price?.toFixed(2)}</span>
                    {selectedPlan?.discount > 0 && (
                      <span className="text-gray-500 text-xs ml-2">(Save {selectedPlan.discount}%)</span>
                    )}
                    <div className="text-gray-500 text-xs">Plus Tax</div>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between items-center py-3 font-bold text-base">
              <span>TOTAL</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mb-6">
            <h4 className="text-base font-semibold mb-3">Please leave your signature below</h4>
            <div className="border-b-2 border-gray-300 pb-2 mb-4">
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Your signature"
                className="w-full text-center text-base italic focus:outline-none"
              />
            </div>
          </div>

          {/* Final Button */}
          <div className="text-center">
            <button className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors font-medium text-sm">
              I'm Ready to Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white py-3 px-4 flex justify-between items-center z-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Your selection:</span>
          <div className="bg-white text-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {selectedServices?.length || 0}
          </div>
        </div>
        <button className="text-white hover:text-gray-200">
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}