"use client"
import { ChevronRight } from "lucide-react"

const QuoteButton = ({ onClick, text = "Quote Services", primaryColor = "#2563EB" }) => {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: primaryColor }}
      className="fixed bottom-6 right-6 flex items-center gap-2 py-3 px-5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 z-50"
    >
      {text}
      <ChevronRight size={20} />
    </button>
  )
}

export default QuoteButton
