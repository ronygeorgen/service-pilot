"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchServices, selectService } from "../../features/user/servicesSlice"
import { clearSearchResults, clearSelectedContact, selectContact } from "../../features/user/contactsSlice"
import { X } from "lucide-react"
import ContactSelectionModal from "./ContactSelectionModal"
import { useQuote } from "../../context/QuoteContext"
import ServiceSelection from "./ServiceSelection"
import QuestionForm from "./QuestionForm"
import PricingOptions from "./PricingOptions"
import Summary from "./Summary"
import ContactAddressSelectionModal from "./ContactAddressSelectionModal"


const QuoteModal = ({ isOpen, onClose, primaryColor = "#2563EB" ,from, contact, Selectedservices, purchase_id, total_amount}) => {
  const dispatch = useDispatch()
  const { services } = useSelector((state) => state.services)
  const { selectedContact } = useSelector(state => state.contacts)
  const[selectedAddress, setSelectedAddress] = useState('');
  const { state, dispatch: quoteDispatch } = useQuote()

  useEffect(() => {
    if (isOpen && services.length === 0) {
      dispatch(fetchServices())
    }
  }, [isOpen, services.length, dispatch])
  
  useEffect(() => {
    if (from === 'review') {
      if (contact) {
        dispatch(selectContact(contact));
      }
    }
  }, [from, contact, Selectedservices, dispatch, quoteDispatch]);


  if (!isOpen) return null

  console.log(selectedContact, 'selectedContact', Selectedservices);

  console.log(state.selectedServices, 'sele', total_amount);

  const selectedServiceNames = Selectedservices?.map(service => service.name) || [];

  const availableServices = services.filter(
    service => !selectedServiceNames.includes(service.name)
  );
  
  const handleBackToContactSelection = () => {
  dispatch(selectContact(contact)) // Clear the selected contact
}


  const handleClose = () => {
    quoteDispatch({ type: "RESET" })
    dispatch(clearSearchResults())
    dispatch(clearSelectedContact())
    setSelectedAddress(null)
    onClose()
  }

  const handleContactSelected = (contact) => {
    // Contact is already set in Redux, we can proceed to service selection
    console.log("Contact selected:", contact, selectedContact)
  }

  const renderContent = () => {
    // Step 1: Contact Selection
    if (!selectedContact) {
      return <ContactSelectionModal onContactSelected={handleContactSelected} />
    }

    if (from!=='review' && !selectedAddress) {
      return (
    <ContactAddressSelectionModal
      contact={selectedContact}
      onAddressSelected={setSelectedAddress}
      onBack={handleBackToContactSelection}
    />
  )
    }

    if (state.showSummary) {
      return <Summary purchase_id={purchase_id} total_amount={total_amount} selectedAddress={selectedAddress}/>
    }

    // Step 2: Show Pricing (after answering questions)
    if (state.showPricing) {
      return <PricingOptions />
    }

    // Step 3: Question Form (after selecting service)
    if (state.currentService) {
      return <QuestionForm questions={state.currentService.questions} serviceId={state.currentService.id} />
    }

    

    // Step 4: Service Selection (after selecting contact)
    if(from=='review'){
      return <ServiceSelection services={availableServices} />
    }
    return <ServiceSelection services={services} />
  }

const getProgressWidth = () => {
  if (state.showSummary) return 100
  if (state.showPricing) return 75
  if (state.currentService && !state.showPricing && !state.showSummary) return 50
  if (selectedContact && !state.currentService) return 25
  return 0
}

  const getTitle = () => {
    if (!selectedContact) return "Select Contact"
    if (state.showPricing) return "Choose Your Plan"
    if (state.currentService) return state.currentService.name
    return "Select a Service"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="py-4 px-6 flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
          <div>
            <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
            {selectedContact && (
              <p className="text-white text-opacity-80 text-sm">
                {selectedContact.first_name} {selectedContact.last_name} - {selectedContact.email}
              </p>
            )}
          </div>
          <button onClick={handleClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
            <X size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${getProgressWidth()}%`,
              backgroundColor: primaryColor,
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="py-6 px-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default QuoteModal