"use client"

import { useState } from "react"
import { useQuote } from "../../context/QuoteContext"

const QuestionForm = ({ questions, serviceId }) => {
  const { state, dispatch } = useQuote()

  const [values, setValues] = useState(() => {
    const initialValues = {}
    questions.forEach((question) => {
      if ((question.type === "number" || question.type === "choice") && Array.isArray(question.options)) {
        question.options.forEach((optionObj) => {
          const label = Object.keys(optionObj)[0]
          const key = `${question.id}-${label}`
          initialValues[key] = state?.answers?.[key] || ""
        })
      } else {
        initialValues[question.id] = state?.answers?.[question.id] || ""
      }
    })
    return initialValues
  })

  const handleChange = (questionId, key, value) => {
    console.log('QuestionForm handleChange:', { questionId, key, value })
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = () => {
    const answers = {}

    questions.forEach((question) => {
      if ((question.type === "number" || question.type === "choice") && Array.isArray(question.options)) {
        question.options.forEach((optionObj) => {
          const label = Object.keys(optionObj)[0]
          const key = `${question.id}-${label}`
          answers[key] = values[key] || 0
        })
      } else {
        answers[question.id] = values[question.id]
      }
    })

    console.log('Submitting answers:', answers)

    // Use the currentService from state instead of searching through services array
    const currentService = state.currentService
    
    if (!currentService) {
      console.error('No current service selected')
      return
    }
    
    dispatch({ type: "SET_ANSWERS", payload: answers })
    dispatch({ type: "SHOW_PRICING" })
  }

  const handleBack = () => {
    dispatch({ type: "SELECT_SERVICE", payload: null })
  }

  const renderFormFields = (question) => {
    if ((question.type === "number" || question.type === "choice") && Array.isArray(question.options)) {
      return (
        <div className="space-y-4">
          {question.options.map((optionObj) => {
            const label = Object.keys(optionObj)[0]
            const price = optionObj[label]
            const inputKey = `${question.id}-${label}`
            return (
              <div key={inputKey} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {label} - ${price} each
                </label>
                <input
                  type="number"
                  min="0"
                  value={values[inputKey] || ""}
                  onChange={(e) => handleChange(question.id, inputKey, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            )
          })}
        </div>
      )
    } else if (question.type === "boolean") {
      // Parse the unit_price properly
      const unitPriceStr = question.unit_price || "0"
      const basePrice = parseFloat(unitPriceStr) || 0
      const hasCost = basePrice > 0
      
      console.log('Rendering boolean question:', {
        questionId: question.id,
        unitPriceStr,
        basePrice,
        hasCost,
        currentValue: values[question.id]
      })
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                console.log('Yes button clicked for question:', question.id)
                handleChange(question.id, question.id, "Yes")
              }}
              className={`px-4 py-2 rounded-md border ${
                values[question.id] === "Yes"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              Yes {hasCost && `(+$${basePrice.toFixed(2)})`}
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('No button clicked for question:', question.id)
                handleChange(question.id, question.id, "No")
              }}
              className={`px-4 py-2 rounded-md border ${
                values[question.id] === "No"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              No
            </button>
          </div>
          {/* Debug info - remove in production */}
          <div className="text-xs text-gray-500">
            Current value: {values[question.id] || 'none'} | Unit price: ${basePrice}
          </div>
        </div>
      )
    }

    return null
  }

  const isFormValid = () => {
    return questions.every((question) => {
      if ((question.type === "number" || question.type === "choice") && Array.isArray(question.options)) {
        return question.options.some((optionObj) => {
          const label = Object.keys(optionObj)[0]
          const key = `${question.id}-${label}`
          const value = values[key]
          return value !== "" && value !== undefined && !isNaN(Number(value)) && Number(value) >= 0
        })
      } else if (question.type === "boolean") {
        return values[question.id] === "Yes" || values[question.id] === "No"
      }
      return false
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Please answer the following questions</h3>
      </div>

      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">{question.text}</h4>
            {renderFormFields(question)}
          </div>
        ))}
      </div>

      {/* Debug section - remove in production */}
      <div className="bg-gray-100 p-4 rounded text-sm">
        <strong>Debug - Current Values:</strong>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className={`px-4 py-2 rounded-md text-white ${
            isFormValid() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          See Pricing
        </button>
      </div>
    </div>
  )
}

export default QuestionForm