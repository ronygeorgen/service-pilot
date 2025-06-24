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
  import { ErrorBoundary } from 'react-error-boundary';

  export default function WindowCleaningQuote() {
    const { quoteId } = useParams();
    const [quoteData, setQuoteData] = useState(null);
    const [selectedServicePlans, setSelectedServicePlans] = useState([]);
    
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { selectedContact } = useSelector((state) => state.contacts)
    const [currentStep, setCurrentStep] = useState(0)
    const [activeTab, setActiveTab] = useState("recurring")
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { state } = useQuote()
    const [pdfError, setPdfError] = useState(false);
    
    const ALLOWED_LOCATION_ID = 'b8qvo7VooP3JD3dIZU42';
    const location = useLocation()
    const { totalPrice: tt, totalSavings, selectedServices } = location.state || {}

    const [deleteConfirmation, setDeleteConfirmation] = useState({
      isOpen: false,
      serviceId: null,
      serviceName: ''
    });

    const [deletingServiceId, setDeletingServiceId] = useState(null);


    const handleDeleteClick = (serviceId, serviceName) => {
      console.log("service id when we delete a service is ==", serviceId);
      
      setDeleteConfirmation({
        isOpen: true,
        serviceId,
        serviceName
      });
    };

    const handleDeleteService = async () => {
      try {

        setDeletingServiceId(deleteConfirmation.serviceId);

        const response = await axiosInstance.delete(
          `/data/purchased-service/delete/${deleteConfirmation.serviceId}/`
        );
        
        // Update state with the response data
        setQuoteData(response.data);
        
        // Update selectedServicePlans to remove the deleted service
        setSelectedServicePlans(prev => 
          prev.filter(item => item.service_id !== deleteConfirmation.serviceId)
        );
        
        // Update selectedPlans to remove the deleted service
        setSelectedPlans(prev => {
          const newPlans = {...prev};
          delete newPlans[deleteConfirmation.serviceId];
          return newPlans;
        });
        
        // Close the confirmation dialog
        setDeleteConfirmation({
          isOpen: false,
          serviceId: null,
          serviceName: ''
        });
        
      } catch (error) {
        console.error('Failed to delete service:', error);
        setDeleteConfirmation(prev => ({
          ...prev,
          error: 'Failed to delete service. Please try again.'
        }));
      }finally {
        setDeletingServiceId(null);
        setDeleteConfirmation(prev => ({
          ...prev,
          isOpen: false,
          serviceId: null,
          serviceName: ''
        }));
      }
    };

    // console.log("Location.pathname ===", location.pathname.split('/'));
    
    // const pathSegments = location.pathname.split('/');

    // console.log("path segments ==", pathSegments);

    function customRound(number) {
      const decimal = number % 1;  // Get the decimal part
      const integer = Math.floor(number);  // Get the integer part
      
      if (decimal >= 0.5) {
        return integer + 1;
      } else {
        return integer;
      }
    }
    

    const queryParams = new URLSearchParams(window.location.search);
    console.log("pathhhhhhhhh off the queryparams===", queryParams);
    
    const locationId = queryParams.get('location');
    const isSpecialLocation = locationId === 'b8qvo7VooP3JD3dIZU42';
    
    console.log("isSpecialLoction == ",isSpecialLocation);

    const handleRetry = () => {
      setPdfError(false);
      window.location.reload(); // OR simply trigger re-render if you have a better retry strategy
    };
    

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
  setIsSubmitting(true);
  setSubmitError(null);

  const { total: totalWithTax } = calculateTotalPrice();

  const payload = {
    purchase_id: quoteData.id,
    total_amount: Number(customRound(totalWithTax)).toFixed(2),
    signature: signature || "Digital Acceptance",
    services: selectedServicePlans
  };

  try {
    const response = await axiosInstance.post(`data/quotes/${quoteId}/submit/`, payload);
    
    // Prepare services data for success page
    const servicesData = quoteData.services.map(service => ({
      name: service.name,
      plan: service.pricingOptions.find(
        plan => plan.id === selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan
      ).name,
      price: selectedServicePlans.find(item => item.service_id === service.id)?.total_amount 
    }));

    // Prepare custom products data for success page
    const customProductsData = quoteData.custom_products?.map(product => ({
      name: product.product_name,
      description: product.description,
      price: customRound(product.price).toFixed(2),
      isCustomProduct: true // Add flag to identify custom products
    })) || [];

    // Navigate to success page with all data
    navigate(`/success?first_name=${quoteData.contact.first_name}&last_name=${quoteData.contact.last_name}&email=${quoteData.contact.email}&phone=${quoteData.contact.phone}`, {
      state: {
        contactName: `${quoteData.contact.first_name} ${quoteData.contact.last_name}`,
        totalAmount: customRound(totalPrice),
        services: [...servicesData, ...customProductsData], // Combine both services and custom products
        customProducts: quoteData.custom_products // Also pass separately if needed
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
      extraChoicePrices: [],
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
      else if (question?.type === 'extra_choice' && question?.selectedOption) {
      // Extra choice question with selected option
      const selectedOption = question.options?.find(opt => opt.label === question.selectedOption);
      if (selectedOption) {
        const optionPrice = parseFloat(selectedOption.value) || 0;
        baseTotal += optionPrice;
        priceBreakdown.extraChoicePrices.push({
          questionText: question?.text,
          selectedOption: question.selectedOption,
          price: optionPrice
        });
      }
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
//   const calculateTotalPrice = () => {
//     if (!quoteData?.services && !quoteData?.custom_products ) return { total: 0, isMinimumPriceApplied: false };
    
//     const servicesTotal  = quoteData.services.reduce((total, service) => {
//       const plans = generatePlans(service);
//       const selectedPlanId = selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan;
//       const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
//       return total + (selectedPlan?.price || 0);
//     }, 0);

//     // Calculate custom products total
//     const customProductsTotal = quoteData.custom_products?.reduce((total, product) => {
//       return total + (product.price || 0);
//     }, 0) || 0;

//     const calculatedTotal = servicesTotal + customProductsTotal;

//     // Get minimum price from response
//     const minimumPrice = parseFloat(quoteData.minimum_price) || 0;
    
//     return {
//     total: Math.max(calculatedTotal, minimumPrice),
//     isMinimumPriceApplied: minimumPrice > 0 && calculatedTotal < minimumPrice,
//     minimumPrice,
//     servicesTotal,
//     customProductsTotal
//   };
// };

const calculateTotalPrice = () => {
  if (!quoteData?.services && !quoteData?.custom_products) {
    return { total: 0, isMinimumPriceApplied: false };
  }

  const servicesTotal = quoteData.services?.reduce((total, service) => {
    const plans = generatePlans(service);
    const selectedPlanId = selectedServicePlans?.find(item => item.service_id === service.id)?.price_plan;
    const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
    return total + (selectedPlan?.price || 0);
  }, 0) || 0;

  const customProductsTotal = quoteData.custom_products?.reduce((total, product) => {
    return total + (customRound(product.price) || 0);
  }, 0) || 0;

  const hasServices = quoteData.services?.length > 0;
  const hasCustomProducts = quoteData.custom_products?.length > 0;

  const minimumPrice = parseFloat(quoteData.minimum_price) || 0;

  let subtotal = 0;
  let isMinimumPriceApplied = false;

  if (hasCustomProducts && !hasServices) {
    // Case 1: Only custom products
    subtotal = customProductsTotal;
  } else if (hasServices) {
    // Case 2 & 3: Services with or without custom products
    const effectiveServicesTotal = servicesTotal < minimumPrice ? minimumPrice : servicesTotal;
    isMinimumPriceApplied = servicesTotal < minimumPrice;
    subtotal = effectiveServicesTotal + customProductsTotal;
  } else {
    // Case 4: Only services
    subtotal = servicesTotal;
  }

  const tax = subtotal * 0.0825;
  const totalWithTax = subtotal + tax;

  return {
    subtotal, // Price before tax
    tax,
    total: totalWithTax,
    isMinimumPriceApplied,
    minimumPrice,
    servicesTotal,
    customProductsTotal,
    hasRegularServices: hasServices
  };
};


const { total: totalPrice, isMinimumPriceApplied, minimumPrice, servicesTotal, customProductsTotal } = calculateTotalPrice();

const isScheduleButtonDisabled = !signature || !termsAccepted;

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, serviceName, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p className="mb-4">
          Are you sure you want to delete <strong>{serviceName}</strong>? This action cannot be undone.
        </p>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={deletingServiceId === deleteConfirmation.serviceId}
            className={`px-4 py-2 border rounded-md ${
              deletingServiceId === deleteConfirmation.serviceId
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteService}
            disabled={deletingServiceId === deleteConfirmation.serviceId}
            className={`px-4 py-2 rounded-md ${
              deletingServiceId === deleteConfirmation.serviceId
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {deletingServiceId === deleteConfirmation.serviceId ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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

            {/* Added About Company Section Here */}
            <div className="mb-6 mt-20">
              <h3 className="text-lg font-semibold mb-3 text-center md:text-center">About Our Company</h3>
              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  <img src="/sevicepilot_logo.png?height=150&width=150" alt="Company Logo" className="h-24 w-24 mx-auto md:mx-0" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Thanks for taking the time to fill out our instant online bid. We know your time is valuable and our
                    instant online bid feature is just one way we help to accommodate your schedule. Whether it is getting
                    the bid done for you quickly or getting your windows cleaned right the first time, we have built our
                    business in a way to prove to you that we are serious about your satisfaction in every way possible!
                  </p>
                  <p className="text-gray-600 mt-3 text-sm text-right">- Arman K</p>
                </div>
                
              </div>
              <p className="text-center text-gray-600 text-sm mb-4">Watch on YouTube</p>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-2xl mx-auto">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/kANi_aj5Aqc"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
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
                      navigate(`/${locationId ? `?location=${locationId}` : ''}`);
                    }
                  } else {
                    navigate(`/${locationId ? `?location=${locationId}` : ''}`);
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
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold mb-2">{service.name || "Service"}</h3>
                    {!isSubmitted && (
                      <button
                        onClick={() => handleDeleteClick(service.id, service.name)}
                        disabled={deletingServiceId === service.id}
                        className={`rounded-full p-2 ${
                          deletingServiceId === service.id 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                        
                      >
                        {deletingServiceId === service.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-sm">Deselect {service.name}</span>
                        )}
                      </button>
                    )}
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
                    <div className="relative mb-6 pl-4"> {/* Added pl-4 for left padding */}
                      <div 
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pr-4" /* Added pr-4 */
                        style={{ 
                          scrollbarWidth: 'none', 
                          msOverflowStyle: 'none',
                          scrollSnapType: 'x mandatory',
                          scrollPadding: '0 16px'
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
                            <div key={plan.id} className="bg-white border rounded-lg overflow-hidden flex-shrink-0 w-72 snap-start">
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
                                  {(plan.priceBreakdown.booleanPrices.length > 0 || plan.priceBreakdown.extraChoicePrices.length > 0) && (
                                    <div className="text-xs text-gray-500 mb-1">
                                      {plan.priceBreakdown.booleanPrices.map((item, idx) => (
                                        <div key={idx}>+ {item.questionText}</div>
                                      ))}
                                      {plan.priceBreakdown.extraChoicePrices.map((item, idx) => (
                                        <div key={idx}>+ {item.questionText}: {item.selectedOption}</div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="text-xl font-bold mb-1">
                                    ${customRound(plan.price).toFixed(2)}
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
                                            ? { ...item, price_plan: plan.id, total_amount:customRound(plan.price).toFixed(2) }
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
                              <div className="text-xl font-bold mb-1">${customRound(selectedPlanData?.price)?.toFixed(2)}</div>
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


        {/* Custom Products Section */}
          {quoteData.custom_products?.length > 0 && (
            <div className="mb-8">
              <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
                <div className="px-4">
                  <h3 className="text-xl font-semibold text-center mb-4">Additional Products</h3>
                  
                  {quoteData.custom_products.map((product, index) => (
                    <div key={index} className="mb-4 border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{product.product_name}</h4>
                          {product.description && (
                            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold">${customRound(product.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Learn More Section */}
        {/* Learn More Section */}
  <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
    <div className="px-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-3">Learn more about us!</h3>
        <p className="text-gray-600 mb-3 text-sm">
          Below is some important information about our terms and conditions, along with an overview of the information you provided during
          the quoting process.
        </p>
        <div className="flex justify-center mt-6">
          <ErrorBoundary fallback={<div className="text-center text-red-600">
              <p>Failed to generate PDF.</p>
              <button
                onClick={handleRetry}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md shadow"
              >
               Click to Re-generate PDF
              </button>
            </div>}>
            <PDFDownloadLink 
              document={
                <QuotePDF 
                  selectedContact={quoteData.contact}
                  selectedServices={quoteData.services}
                  selectedPlans={selectedPlans}
                  totalPrice={(totalPrice)}
                  signature={quoteData?.is_submited ? quoteData.signature : signature}
                  minimumPrice={quoteData.minimum_price}
                  isMinimumPriceApplied={parseInt(totalPrice) > 0 && parseInt(quoteData.minimum_price) >= parseInt(totalPrice)}
                  customProducts={quoteData.custom_products}
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
          </ErrorBoundary>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("recurring")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "recurring" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Recurring Service Terms
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "terms" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Terms and Conditions
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


{activeTab === "recurring" && (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold">Recurring Service Agreement (Window Cleaning & Gutter Cleaning)</h4>
    <div className="text-gray-600 text-sm space-y-2">
      <p>This Recurring Service Agreement outlines the terms and conditions for ongoing window cleaning and/or gutter cleaning services provided by TruShine Window Cleaning.</p>

      <h5 className="font-semibold">1. Scope of Services</h5>
      <p>TruShine agrees to perform recurring services, which may include:</p>
      <ul className="list-disc ml-5">
        <li><strong>Window Cleaning:</strong>
          <ul className="list-disc ml-5">
            <li>Exterior window cleaning for all accessible glass</li>
            <li>Optional interior window cleaning if included</li>
            <li>Add-on services such as screen cleaning, track detailing, and hard water removal are available for an additional fee</li>
          </ul>
        </li>
        <li><strong>Gutter Cleaning:</strong>
          <ul className="list-disc ml-5">
            <li>Removal of leaves and debris from gutters</li>
            <li>Flushing of downspouts to ensure proper water flow</li>
            <li>Light roof debris removal near gutter lines when safely accessible</li>
          </ul>
        </li>
        <li>Services will be performed on a recurring basis according to the selected frequency (monthly, bi-monthly, quarterly, semi-annual, or annual) and will continue until canceled per the terms below.</li>
      </ul>

      <h5 className="font-semibold">2. Pricing & Payment Terms</h5>
      <ul className="list-disc ml-5">
        <li>Clients on recurring service receive <strong>discounted pricing</strong> compared to one-time service rates</li>
        <li>Pricing is based on property size, service scope, and access conditions</li>
        <li>Payment is due upon completion of each service unless prepaid or otherwise agreed</li>
        <li>A valid credit card must be kept on file for automated billing; receipts are sent via email after each charge</li>
      </ul>

      <h5 className="font-semibold">3. Term, Renewal & Cancellation</h5>
      <ul className="list-disc ml-5">
        <li><strong>Agreement Terms by Frequency:</strong>
          <ul className="list-disc ml-5">
            <li><strong>Monthly, Bi-Monthly, Quarterly, and Semi-Annual Services:</strong> Require a <strong>minimum commitment of one full year</strong></li>
            <li><strong>Quarterly Services:</strong> Minimum of <strong>4 scheduled services</strong></li>
            <li><strong>Semi-Annual Services:</strong> Minimum of <strong>2 scheduled services</strong></li>
            <li><strong>Annual Services:</strong> Require a <strong>minimum 2-year commitment with at least 2 scheduled services per year</strong></li>
          </ul>
        </li>
        <li><strong>Termination Rights:</strong>
          <ul className="list-disc ml-5">
            <li>Either party may terminate this agreement <strong>after the minimum service commitment is met</strong> by providing at least <strong>14 days' written notice</strong></li>
            <li>TruShine reserves the right to cancel or reschedule service due to weather, safety concerns, or access limitations</li>
          </ul>
        </li>
        <li><strong>Early Cancellation Policy:</strong>
          <ul className="list-disc ml-5">
            <li>If the client cancels <strong>before fulfilling their minimum service term</strong>, a cancellation fee will apply</li>
            <li>This fee equals the <strong>difference between the discounted recurring rate and the standard one-time service rate</strong> (plus tax) for all completed services</li>
            <li>The cancellation fee will be <strong>charged to the card on file</strong> on the day of cancellation</li>
          </ul>
        </li>
        <li><strong>Post-Term Continuation:</strong>
          <ul className="list-disc ml-5">
            <li>Once the initial contract term is met, services will continue at the same recurring rate unless the client provides written notice to cancel</li>
            <li>No price increases will apply without client approval or advance written notice</li>
          </ul>
        </li>
      </ul>

      <h5 className="font-semibold">4. Client Responsibilities</h5>
      <ul className="list-disc ml-5">
        <li>Ensure all service areas are accessible on scheduled service dates (e.g., gates unlocked, pets secured)</li>
        <li>Notify TruShine of any pre-existing issues, fragile items, or safety concerns prior to service</li>
        <li>Communicate promptly about scheduling changes or property access restrictions</li>
      </ul>

      <h5 className="font-semibold">5. Service Adjustments</h5>
      <ul className="list-disc ml-5">
        <li>Service pricing may be updated if property conditions change or if the service scope is modified</li>
        <li>Clients may request upgrades, frequency changes, or add-on services with written notice</li>
        <li>TruShine will always provide advance notice of any pricing updates</li>
      </ul>

      <h5 className="font-semibold">6. Insurance & Liability</h5>
      <ul className="list-disc ml-5">
        <li>TruShine is fully insured and exercises care during all services</li>
        <li>TruShine is not responsible for pre-existing damage such as aged gutters, broken seals, or cracked panes</li>
        <li>Any service concerns must be reported within <strong>48 hours</strong> of completion for review and resolution</li>
      </ul>

      <p>By continuing recurring services with TruShine Window Cleaning, the client acknowledges and agrees to all terms outlined in this agreement.</p>
    </div>
  </div>
)}



      {activeTab === "terms" && (
        <div className="space-y-4 pr-2">
          <h4 className="text-lg font-semibold">Terms and Conditions</h4>
          <div className="text-xs text-gray-600 space-y-3">
            <p>"We" or "our" or "TWC" refers to Trushine Window Cleaning Ltd. "You", "your" or "the client" refers to the customer receiving the service(s) detailed.</p>
            
            <p>– Any special accommodation has to be reviewed and accepted by management staff prior accepting the proposal.</p>
            <p>– Quotations are valid for 30 days, and accepted only in writing by signature and will subject to the Terms and Conditions herein on the day of services.</p>
            <p>– All work shall be completed in workmanship like manner, and if applicable, in compliance with all building codes and other applicable laws.</p>
            <p>– TWC warrants that it is adequately insured for injury to its employees and other incurring loss of injury as a result of the acts of its employees.</p>
            <p>– TWC reserves the right to change these terms and conditions at any time without prior notice. In the event that any changes are made, the revised terms and conditions shall be posted on the website immediately.</p>

            <h5 className="font-semibold">WINDOWS:</h5>
            <ul className="list-disc ml-5 space-y-1">
              <li>All windows must be closed on day of service. Any open windows which cannot be closed will not be washed.</li>
              <li>You must ensure that all items to be cleaned are structurally sound prior to cleaning; Trushine Window Cleaning LTD reserves the right to photograph and/or notate any areas not structurally sound, and will notify the client prior to services being performed.</li>
              <li>Full access is required on the day of the clean/repair. We are unable to move any obstacles which may inhibit cleaning or repair. Should partial access on the scheduled day reduce the extent of the clean/repair, we reserve the right to charge for a percentage of the windows/repair completed. If no access is available the day of the scheduled clean/repair, a $100 trip fee charge will be incurred.</li>
              <li>We will not clean any windows we consider to be inaccessible or unsafe on the day of the clean.</li>
              <li>External glass surfaces will usually be washed with pure water from water fed poles, and will be left to dry naturally.</li>
              <li>A window or door is defined as any part which consists of frame, sill, sash and glass, made of wood, aluminium, steel or UVPC.</li>
              <li>Sills made of brick, tile, stone, or any material other than listed above may damage our brushes, and will not be washed.</li>
              <li>TWC has 24 Hours Streak FREE Guarantee on all of our window cleaning packages.</li>
            </ul>

            <h5 className="font-semibold">PRESSURE WASHING:</h5>
            <ul className="list-disc ml-5 space-y-1">
              <li>Although pressure washing will remove most stains from patio, paths, and driveways, some marks may not be removed by this process.</li>
              <li>We require access to an external water supply to complete any pressure washing services.</li>
              <li>Client is responsible to cover/remove all valuable outdoor furniture or there will be a $150 additional fee to remove furniture (Trushine is not responsible for any damages made by chemicals to any outdoor furniture or appliances).</li>
              <li>TWC has 3 days guarantee on premium pressure washing package only.</li>
            </ul>

            <h5 className="font-semibold">GUTTERS:</h5>
            <ul className="list-disc ml-5 space-y-1">
              <li>Basic gutter cleaning is restricted to the gutters, and does not include hauling away debris or repair/replacement of any parts unless otherwise agreed. Additional costs may apply.</li>
              <li>Gutter cleaning entails only the cleaning out of the inside of the gutter by leaf blower during summer/spring or gutter scoop during winter/fall.</li>
              <li>It does not include the cleaning of any exterior surface of the gutter (available at an additional cost).</li>
              <li>TWC has 15 days guarantee on all gutter cleaning packages.</li>
            </ul>

            <h5 className="font-semibold">AWNINGS:</h5>
            <ul className="list-disc ml-5 space-y-1">
              <li>We do not accept liability for any unforeseen circumstances or damages caused during the services provided.</li>
              <li>We reserve the right to decline any awning cleaning service if the substrate is over 5 years old or fails our inspection.</li>
              <li>TWC has 24 hours guarantee on all awning cleaning services.</li>
            </ul>

            <h5 className="font-semibold">RESCHEDULING, PAYMENTS, CLIENT RESPONSIBILITY:</h5>
            <ul className="list-disc ml-5 space-y-1">
              <li>Postponement of any service requires 48-hour notice. Less notice or same-day cancellations may incur a $100 trip fee.</li>
              <li>Trushine cannot be held liable for delays due to material shortage, weather, or other uncontrollable events.</li>
              <li>Payments are due upon receipt. TWC may require credit card information or a $100 deposit to schedule. 50% deposit required for jobs requiring materials.</li>
              <li>Accepted payment methods: cash, check, credit card (in person, phone, or online).</li>
              <li>Commercial account payments can be sent to: 10515 Southwest FWY, Ste E-06 Houston, TX 77074.</li>
              <li>Clients with outstanding balances may be refused service.</li>
              <li>Disputed payments are the client's responsibility to prove cleared. Late charges and recovery fees may apply.</li>
              <li>Account termination may occur without notice, and terminated accounts will lose promotional eligibility.</li>
              <li><strong>Late fee schedule:</strong>
                <ul className="list-disc ml-5">
                  <li>Residential: 10% after 10 days.</li>
                  <li>Commercial: 10% after 30 days.</li>
                  <li>Unpaid after 60 days: collection process begins (including legal fees).</li>
                </ul>
              </li>
              <li>All sales are final. No refunds except for damaged materials.</li>
              <li>7 days written notice required for residential contract termination. Less notice incurs full service charge.</li>
              <li>All services are subject to applicable Texas state tax.</li>
              <li>Complaints resulting in a service revisit that confirms work was satisfactory will incur a $100 trip fee.</li>
              <li>Terms may change anytime without notice. Updated copies available upon request.</li>
            </ul>

            <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this agreement by accepting this proposal, electronically or in writing.</p>
            <p className="italic text-right">LAST UPDATED ON 06/25/2025</p>
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
                {/* Boolean Question Display */}
                {question?.type === 'boolean' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">{question?.text}</span>
                    <span className="font-medium">
                      {question?.bool_ans ? 'Yes' : 'No'}
                      {question?.bool_ans && question.unit_price !== '0.00' && (
                        <span className="ml-1 text-gray-500 text-sm">
                          (+${parseFloat(question.unit_price || 0).toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Choice Question Display */}
                {question?.type === 'choice' && question?.options && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">{question?.text}</span>
                    </div>
                    <div className="mt-2 pl-4">
                      {question?.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {option?.label}:
                          </span>
                          <span className="font-medium">
                            {option?.qty} × ${option?.value} = 
                            <span className="ml-1">
                              ${(parseFloat(option?.value) * parseInt(option?.qty || 0)).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Extra Choice Question Display */}
                {question?.type === 'extra_choice' && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">{question?.text}</span>
                    <span className="font-medium flex flex-col">
                     
                        <span className="ml-1 text-gray-500 text-sm">
                          {question?.options[0]?.label
                            ? question.options[0].label.charAt(0).toUpperCase() + question.options[0].label.slice(1)
                            : 0}
                        </span>
                        <span className="ml-1 text-gray-500 text-sm">
                           $ {question?.options[0]?.value || 0}
                        </span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}

    {/* Custom Products Section */}
    {quoteData.custom_products?.length > 0 && (
      <div className="mb-6 border p-4 rounded-lg bg-gray-50">
        <h5 className="font-medium text-lg mb-3">Additional Products</h5>
        <div className="space-y-3">
          {quoteData.custom_products.map((product, index) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">{product.product_name}</span>
                <span className="font-medium">
                  ${customRound(product.price).toFixed(2)}
                </span>
              </div>
              {product.description && (
                <p className="text-gray-600 text-sm mt-1">{product.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
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
                        <div className="text-gray-500 text-sm">Plus Tax</div>
                      </div>
                    </div>
                  );
                })}

                {quoteData.custom_products?.map((product, index) => (
                  <div key={`custom-${index}`} className="flex justify-between items-center py-3 border-b">
                    <div className="text-left">
                      <span className="text-blue-500 font-medium text-sm">
                        {product.product_name?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">${customRound(product.price).toFixed(2)}</span>
                      <div className="text-gray-500 text-sm">Plus Tax(8.25%)</div>
                    </div>
                  </div>
                ))}

                {isMinimumPriceApplied && (
                  <div className="text-sm text-gray-600 mb-2 text-center">
                    <p>
                      <span className="font-medium">Note:</span> The total reflects our minimum service price of <span className="font-bold text-lg text-blue-500"> ${minimumPrice.toFixed(2)}</span>.
                    </p>
                    <p>This ensures we can deliver the quality service you expect.</p>
                  </div>
                )}

                

                <div className="flex justify-between items-center py-3 font-bold text-base">
                  <span className="text-2xl">TOTAL (including 8.25% tax)</span>
                  <span className="text-2xl">${customRound(totalPrice).toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-end gap-2 text-sm text-gray-700">
                  <span>Tax (8.25%)</span>
                  <span>${(totalPrice * 0.0825).toFixed(2)}</span>
                </div> */}
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
                <div className="mb-6 flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="termsCheckbox" className="text-sm text-gray-700">
                    I have read and agree to all terms and conditions
                  </label>
                </div>

                <button
                  onClick={handleSubmitPurchase}
                  disabled={ !termsAccepted }
                  className={`px-6 py-3 rounded transition-colors font-medium text-sm ${
                     !termsAccepted
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
        <DeleteConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({
            isOpen: false,
            serviceId: null,
            serviceName: '',
            error: null
          })}
          onConfirm={handleDeleteService}
          serviceName={deleteConfirmation.serviceName}
          error={deleteConfirmation.error}
        />
      </div>
    );
  }