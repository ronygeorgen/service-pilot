"use client"
import { X } from "lucide-react"
import { useQuote } from "../../context/QuoteContext"
import ServiceSelection from "./ServiceSelection"
import QuestionForm from "./QuestionForm"
import PricingOptions from "./PricingOptions"

const QuoteModal = ({ isOpen, onClose, primaryColor = "#2563EB" }) => {
  const { state, dispatch } = useQuote()

  if (!isOpen) return null

  const handleClose = () => {
    dispatch({ type: "RESET" })
    onClose()
  }

  const renderContent = () => {
    if (state.showPricing) {
      return <PricingOptions />
    }

    if (state.currentService) {
      return <QuestionForm questions={state.currentService.questions} serviceId={state.currentService.id} />
    }

    return <ServiceSelection />
  }

  const getProgressWidth = () => {
    if (state.showPricing) return 100
    if (state.currentService) return 50
    return 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="py-4 px-6 flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
          <h2 className="text-xl font-bold text-white">
            {state.showPricing
              ? "Choose Your Plan"
              : state.currentService
                ? state.currentService.name
                : "Select a Service"}
          </h2>
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
        <div className="py-6 px-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 65px)" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default QuoteModal
