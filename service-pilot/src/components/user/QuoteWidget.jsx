"use client"

import { useState } from "react"
import { QuoteProvider } from "../../context/QuoteContext"
import QuoteButton from "./QuoteButton"
import QuoteModal from "./QuoteModal"

const QuoteWidget = ({ buttonText = "Quote Services", primaryColor = "#2563EB", secondaryColor = "#10B981" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <QuoteProvider>
      <div className="quote-widget">
        <QuoteButton onClick={handleOpenModal} text={buttonText} primaryColor={primaryColor} />
        <QuoteModal isOpen={isModalOpen} onClose={handleCloseModal} primaryColor={primaryColor} />
      </div>
    </QuoteProvider>
  )
}

export default QuoteWidget
