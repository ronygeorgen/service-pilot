"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Check, X, ChevronRight, ChevronUp, ChevronDown, FileText } from "lucide-react"
import { useQuote } from "../../context/QuoteContext"
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux' 
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';
import { axiosInstance } from "../../services/api"
import { useParams } from 'react-router-dom';

export default function WindowCleaningQuote() {
  const { quoteId } = useParams();
  const [quoteData, setQuoteData] = useState(null);
  const [selectedServicePlans, setSelectedServicePlans] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedContact } = useSelector((state) => state.contacts)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState("about")
  const { state } = useQuote()

  const ALLOWED_LOCATION_ID = 'b8qvo7VooP3JD3dIZU42';
  const location = useLocation()
  const { totalPrice: tt, totalSavings, selectedServices } = location.state || {}


  const isSpecialLocation = location.pathname.includes(ALLOWED_LOCATION_ID);

  const [expandedSections, setExpandedSections] = useState({
    note: false,
    photos: false,
  })
  const [signature, setSignature] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const scrollRef = useRef(null)
  const [selectedPlans, setSelectedPlans] = useState({})
  const navigate = useNavigate();


  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        const response = await axiosInstance.get(`/data/user/review/${quoteId}/`);
        const data = response.data;
        setQuoteData(data);

        console.log(data?.services, 'kdj');

        if (data?.services) {
          const initialSelectedPlans = data.services?.map(service => {
            const plans = generatePlans(service);

            console.log(plans, 'plans');
            
            const selectedPlan = plans.find(plan => plan.id === service?.price_plan);

            console.log(selectedPlan, 'selected_plan');
            

            return {
              service_id: service.id,
              price_plan: service.price_plan || null,
              total_amount: selectedPlan?.price.toFixed(2),
            };
          });

          console.log(initialSelectedPlans, 'initial');
          

          setSelectedServicePlans(initialSelectedPlans);
        }
        
        // Initialize selected plans from the quote data
        if (response.data?.services) {
          const initialSelectedPlans = {};
          response.data.services.forEach(service => {
            if (service.pricingOptions && service.pricingOptions.length > 0) {
              // Use the submitted price plan if exists, otherwise use the first option
              initialSelectedPlans[service.id] = 
                service.price_plan
            }
          });
          setSelectedPlans(initialSelectedPlans);
        }
      } catch (err) {
        console.log(err, 'errr');
        
        setError(err.message || 'Failed to fetch quote data');
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteData();
    }
  }, [quoteId]);

  const handleSubmitPurchase = async () => {
    if (!signature.trim()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      purchase_id: quoteData.id,
      total_amount: Number(quoteData.total_amount).toFixed(2),
      signature: signature,
      services: selectedServicePlans
    };

    try {
      // Submit the quote with selected plan
      const response = await axiosInstance.post(`data/quotes/${quoteId}/submit/`, payload);
      console.log('Submission success:', response.data, quoteData);

      // Navigate to success page after successful submission
      navigate('/success', {
        state: {
          contactName: `${quoteData.contact.first_name} ${quoteData.contact.last_name}`,
          totalAmount: totalPrice,
          services: quoteData.services.map(service => ({
            name: service.name,
            plan: service.pricingOptions.find(
              plan => plan.id === selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan
            ).name,
            price: selectedServicePlans.find(item => item.service_id === service.id)?.total_amount 
          }))
        }
      });
    } catch (error) {
      console.error('Purchase submission failed:', error);
      setSubmitError(error.response?.data?.message || 'Failed to submit purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  console.log(selectedServicePlans, 'seeddddddqwee  e');

  console.log(selectedPlans, 'planssss');
  
  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  };

  // Calculate the total price for each pricing option
  const calculatePlanPrice = (pricingOption, service) => {
  let baseTotal = 0;
  const priceBreakdown = {
    basePrice: 0,
    booleanPrices: [],
    optionPrices: [],
    total: 0
  };

  // Calculate prices from questions
  service.questions?.forEach(question => {
    const reaction = question?.reactions?.[0]; // Get the first reaction
    
    if (question?.type === 'boolean' && question?.bool_ans) {
      // Boolean question with "Yes" answer
      const price = parseFloat(question?.unit_price) || 0;
      baseTotal += price;
      priceBreakdown.booleanPrices.push({
        questionText: question?.text,
        price: price
      });
    } 
    else if (question?.type === 'choice' && question?.options) {
      // Choice question with options
      question?.options.forEach(option => {
        const optionPrice = parseFloat(option.value) || 0;
        const quantity = parseInt(option.qty) || 0;
        const optionTotal = optionPrice * quantity;
        
        baseTotal += optionTotal;
        priceBreakdown.optionPrices.push({
          optionName: option?.label,
          unitPrice: optionPrice,
          quantity: quantity,
          total: optionTotal
        });
      });
    }
  });

  priceBreakdown.basePrice = baseTotal;
  priceBreakdown.total = baseTotal;
  
  const discount = pricingOption.discount || 0;
  const discountedPrice = discount > 0 
    ? baseTotal * (1 - discount / 100)
    : baseTotal;
  
  return {
    basePrice: baseTotal,
    discountedPrice: discountedPrice,
    savings: baseTotal - discountedPrice,
    priceBreakdown: priceBreakdown
  };
};

  // Generate plans for a service
const generatePlans = (service) => {
  if (!service.pricingOptions) return [];
  
  return service.pricingOptions.map(option => {
    const priceInfo = calculatePlanPrice(option, service);
    
    return {
      id: option.id,
      name: option.name.charAt(0).toUpperCase() + option.name.slice(1),
      basePrice: priceInfo.basePrice,
      price: priceInfo.discountedPrice,
      savings: priceInfo.savings,
      discount: option.discount,
      features: option.selectedFeatures || [],
      priceBreakdown: priceInfo.priceBreakdown
    };
  });
};

  const steps = [
    { id: 0, color: "bg-blue-500" },
    { id: 1, color: "bg-blue-500" },
    { id: 2, color: "bg-green-500" },
    { id: 3, color: "bg-gray-400" },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const scrollPlans = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };


// Calculate total price across all services
const calculateTotalPrice = () => {
  if (!quoteData?.services) return { total: 0, isMinimumPriceApplied: false };
  
  const calculatedTotal = quoteData.services.reduce((total, service) => {
    const plans = generatePlans(service);
    const selectedPlanId = selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan;
    const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
    return total + (selectedPlan?.price || 0);
  }, 0);

  // Get minimum price from response
  const minimumPrice = parseFloat(quoteData.minimum_price) || 0;
  
  return {
    total: Math.max(calculatedTotal, minimumPrice),
    isMinimumPriceApplied: minimumPrice > 0 && calculatedTotal < minimumPrice,
    minimumPrice
  };
};

const { total: totalPrice, isMinimumPriceApplied, minimumPrice } = calculateTotalPrice();



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading quote: {error}</p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p>No quote data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 pb-20">
      {/* Header Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 pt-6 pb-4">
        <div className="text-center px-4">
          <div className="mb-6">
            <img src="/sevicepilot_logo.png?height=120&width=120" alt="Tru Shine Logo" className="mx-auto h-16 w-16" />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">PREPARED FOR:</h2>
            {quoteData.contact ? (
              <>
                <p className="text-base font-medium">
                  {quoteData.contact.first_name} {quoteData.contact.last_name}
                </p>
                {quoteData.contact.phone && (
                  <p className="text-gray-600 text-sm">
                    Phone: {formatPhoneNumber(quoteData.contact.phone)}
                  </p>
                )}
                {quoteData.contact.email && (
                  <p className="text-gray-600 text-sm">
                    Email: {quoteData.contact.email}
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
      {/* Return to Home Button - Conditionally Rendered */}
        {isSpecialLocation && (
          <div className="text-center my-4">
            <button
              onClick={() => {
                if (!quoteData.is_submited) {
                  const confirmLeave = window.confirm(
                    "Are you sure you want to leave?"
                  );
                  if (confirmLeave) {
                    navigate('/');
                  }
                } else {
                  navigate('/');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>


      {/* Loop through each service */}
      {quoteData.services?.map((service, serviceIndex) => {
        
        const plans = generatePlans(service);
        const selectedPlanId = selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan;
        console.log(selectedPlanId, quoteData, 'kkkd');
        
        const selectedPlanData = plans.find(plan => plan.id === selectedPlanId);
        const isSubmitted = quoteData.is_submited;

        return (
          <div key={serviceIndex} className="mb-8">
            {/* Service Video Section */}
            <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
              <div className="px-4">
                <h3 className="text-xl font-semibold text-center mb-2">{service.name || "Service"}</h3>
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
                    {service.description || "No description available"}
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
                {!isSubmitted ? (
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
                        const planFeatures = service.features?.map(feature => {
                          const isIncluded = plan.features.some(
                            pf => pf.id === feature.id && pf.is_included
                          );
                          return {
                            name: feature.name,
                            included: isIncluded
                          };
                        }) || [];

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
                                      <X className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs ${feature.included ? "text-gray-800" : "text-gray-400"}`}>
                                      {feature.name}
                                    </span>
                                  </li>
                                ))}
                              </ul>

                              <div className="text-center">
                                {plan.discount > 0 && (
                                  <div className="text-gray-500 text-sm line-through mb-1">
                                    ${plan.basePrice.toFixed(2)}
                                  </div>
                                )}
                                
                                {/* Show price breakdown if needed */}
                                {plan.priceBreakdown.booleanPrices.length > 0 && (
                                  <div className="text-xs text-gray-500 mb-1">
                                    {plan.priceBreakdown.booleanPrices.map((item, idx) => (
                                      <div key={idx}>+ {item.questionText}</div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="text-xl font-bold mb-1">
                                  ${plan.price.toFixed(2)}
                                </div>
                                
                                {plan.discount > 0 && (
                                  <div className="text-green-500 text-xs mb-1">
                                    Save ${plan.savings.toFixed(2)}
                                  </div>
                                )}
                                <div className="text-gray-500 text-xs mb-3">Plus Tax</div>

                                <button
                                  onClick={() => {
                                    setSelectedServicePlans(prev =>
                                      prev.map(item =>
                                        item.service_id === service.id
                                          ? { ...item, price_plan: plan.id, total_amount:plan.price.toFixed(2) }
                                          : item
                                      )
                                    );
                                    setSelectedPlans(prev => ({
                                      ...prev,
                                      [service.id]: plan.id
                                    }));

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
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-gray-100 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">Selected Plan</h4>
                    {selectedPlanData && (
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="bg-green-500 text-white text-center py-3">
                          <h4 className="text-base font-semibold">{selectedPlanData?.name}</h4>
                          {selectedPlanData?.discount > 0 && (
                            <p className="text-xs mt-1">Save {selectedPlanData?.discount}%</p>
                          )}
                        </div>

                        <div className="p-4">
                          <ul className="space-y-2 mb-4">
                            {selectedPlanData?.features?.map((feature, index) => {
                              const isIncluded = feature?.is_included
                              return (
                                <li key={index} className="flex items-start space-x-2">
                                  {isIncluded ? (
                                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <span className={`text-xs ${isIncluded ? "text-gray-800" : "text-gray-400"}`}>
                                    {feature.name}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>

                          <div className="text-center">
                            {selectedPlanData.discount > 0 && (
                              <div className="text-gray-500 text-sm line-through mb-1">${selectedPlanData.basePrice.toFixed(2)}</div>
                            )}
                            <div className="text-xl font-bold mb-1">${selectedPlanData?.price?.toFixed(2)}</div>
                            {selectedPlanData.discount > 0 && (
                              <div className="text-green-500 text-xs mb-1">Save ${selectedPlanData.savings.toFixed(2)}</div>
                            )}
                            <div className="text-gray-500 text-xs">Plus Tax</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
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
            <div className="flex justify-center mt-6">
              <PDFDownloadLink 
                document={
                  <QuotePDF 
                    selectedContact={quoteData.contact}
                    selectedServices={quoteData.services}
                    selectedPlans={selectedPlans}
                    totalPrice={totalPrice}
                    signature={quoteData?.is_submited ? quoteData.signature : signature}
                    minimumPrice={quoteData.minimum_price}  // Add this
                    isMinimumPriceApplied={parseInt(totalPrice) > 0 && parseInt(quoteData.minimum_price) >= parseInt(totalPrice)}
                  />
                } 
                fileName={`quote_${quoteData.contact?.first_name || 'customer'}.pdf`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                {({ loading }) => (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>{loading ? 'Generating PDF...' : 'Download PDF Quote'}</span>
                  </div>
                )}
              </PDFDownloadLink>
            </div>
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
                <img src="/sevicepilot_logo.png?height=150&width=150" alt="Company Logo" className="h-24 w-24" />
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
              {quoteData.services?.map((service, index) => (
                <div key={index} className="mb-6 border p-4 rounded-lg bg-gray-50">
                  <h5 className="font-medium text-lg mb-3">{service.name}</h5>
                  <div className="space-y-3">
                    {service.questions?.map((question) => {
                      const reaction = question?.reactions?.[0];
                      
                      return (
                        <div key={question?.id} className="border-b pb-2 last:border-b-0">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">{question?.text}</span>
                            {question?.type === 'boolean' && (
                              <span className="font-medium">
                                {question?.bool_ans ? 'Yes' : 'No'}
                              </span>
                            )}
                          </div>
                          
                          {question?.type === 'choice' && question?.options && (
                            <div className="mt-2 pl-4">
                              {question?.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {option?.label}:
                                  </span>
                                  <span className="font-medium">
                                    {option?.qty} × ${option?.value} = 
                                    <span className="ml-1">
                                      ${(parseFloat(option?.value) * parseInt(option?.qty)).toFixed(2)}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question?.type === 'boolean' && question?.bool_ans && question.unit_price !== '0.00' && (
                            <div className="text-right text-sm text-gray-500 mt-1">
                              +${parseFloat(question.unit_price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-3">Disclaimer</h4>
            <div className="text-xs text-gray-600 space-y-3">
              <div>
                <p className="font-medium">Terms and Conditions</p>
                <p>
                  "We" or "our" or "TWC" refers to Trushine Window Cleaning Ltd. "You", "your" or "the client" refers to
                  the customer receiving the service(s) detailed.
                </p>
              </div>

              <p>
                – Any special accommodation has to be reviewed and accepted by management staff prior accepting the
                proposal.
              </p>
              <p>
                – Quotations are valid for 30 days, and accepted only in writing by signature and will subject to the
                Terms and Conditions herein on the day of services.
              </p>
              <p>
                – All work shall be completed in workmanship like manner, and if applicable, in compliance with all
                building codes and other applicable laws.
              </p>
              <p>
                – TWC warrants that it is adequately insured for injury to its employees and other incurring loss of
                injury as a result of the acts of its employees.
              </p>
              <p>
                – TWC reserves the right to change these terms and conditions at any time without prior notice. In the
                event that any changes are made, the revised terms and conditions shall be posted on the website
                immediately.
              </p>

              <div className="mt-4">
                <p className="font-medium">SELECTED SERVICES:</p>
                {quoteData.services?.length > 0 ? (
                  quoteData.services.map((service, index) => (
                    <div key={index} className="mb-3">
                      <p className="font-medium">{service.name?.toUpperCase()}:</p>
                      <p>{service.description || "No description available"}</p>
                    </div>
                  ))
                ) : (
                  <p>– No services selected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Booking Section - Only show if not submitted */}
      {!quoteData.is_submited && (
        <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
          <div className="px-4">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4 text-sm">
                Please review the details below to confirm that we got everything right, and then we'll go ahead and book
                you in.
              </p>

              <h3 className="text-lg font-semibold mb-4">You've chosen the following services:</h3>

              {quoteData.services?.map((service, index) => {
                const plans = generatePlans(service);
                const selectedPlanId = selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan;
                const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
                console.log(selectedPlan, selectedPlanId, 'lddj');
                

                return (
                  <div key={index} className="flex justify-between items-center py-3 border-b">
                    <div className="text-left">
                      <span className="text-blue-500 font-medium text-sm">
                        {service.name?.toUpperCase()} ({selectedPlan?.name?.toUpperCase()})
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
                );
              })}

              {isMinimumPriceApplied && (
                <div className="text-sm text-gray-600 mb-2 text-center">
                  <p>
                    <span className="font-medium">Note:</span> The total reflects our minimum service price of ${minimumPrice.toFixed(2)}.
                  </p>
                  <p>This ensures we can deliver the quality service you expect.</p>
                </div>
              )}

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
                  style={{ 
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '1rem',
                    outline: 'none',
                    fontStyle: 'italic' // Simple italic instead of custom font
                  }}
                />
              </div>
            </div>

            {/* Final Button */}
            <div className="text-center">
              <button
                onClick={handleSubmitPurchase}
                disabled={!signature.trim() || isSubmitting}
                className={`px-6 py-3 rounded transition-colors font-medium text-sm ${
                  !signature.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isSubmitting ? "Submitting..." : "I'm Ready to Schedule"}
              </button>
              {submitError && (
                <div className="mb-4 text-red-500 text-center text-sm">
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      {!quoteData.is_submited && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white py-3 px-4 flex justify-between items-center z-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Your selection:</span>
            <div className="bg-white text-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {quoteData.services?.length || 0}
            </div>
          </div>
          <button className="text-white hover:text-gray-200">
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}