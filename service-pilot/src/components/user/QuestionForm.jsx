"use client"

import { useState } from "react"
import { useQuote } from "../../context/QuoteContext"

const QuestionForm = ({ questions, serviceId }) => {
  const { state, dispatch } = useQuote()
  const [values, setValues] = useState(() => {
    const initialValues = {}
    questions.forEach((question) => {
      if (question.type === "number" && Array.isArray(question.options)) {
        question.options.forEach((option) => {
          const key = `${question.id}-${option}`
          initialValues[option] = state?.answers?.[key] || ""
        })
      } else {
        initialValues[question.id] = state?.answers?.[question.id] || ""
      }
    })
    return initialValues
  })

  const handleChange = (questionId, option, value) => {
    setValues((prev) => ({
      ...prev,
      [option]: value,
    }))
  }

  const handleSubmit = () => {
    const answers = {}

    questions.forEach((question) => {
      if (question.type === "number" && Array.isArray(question.options)) {
        question.options.forEach((option) => {
          const key = `${question.id}-${option}`
          answers[key] = values[option] || 0
        })
      } else {
        answers[question.id] = values[question.id]
      }
    })

    dispatch({ type: "SET_ANSWERS", payload: answers })
    dispatch({ type: "SHOW_PRICING" })
  }

  const handleBack = () => {
    dispatch({ type: "SELECT_SERVICE", payload: null })
  }

  const renderFormFields = (question) => {
    if (question.type === "number" && Array.isArray(question.options)) {
      return (
        <div className="space-y-4">
          {question.options.map((option) => (
            <div key={option} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{option}</label>
              <input
                type="number"
                min="0"
                value={values[option] || ""}
                onChange={(e) => handleChange(question.id, option, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      )
    } else if (question.type === "boolean") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleChange(question.id, question.id, "Yes")}
              className={`px-4 py-2 rounded-md border ${
                values[question.id] === "Yes"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleChange(question.id, question.id, "No")}
              className={`px-4 py-2 rounded-md border ${
                values[question.id] === "No"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              No
            </button>
          </div>
        </div>
      )
    } else if (question.type === "select" || question.type === "choice") {
      return (
        <div className="space-y-2">
          <select
            value={values[question.id] || ""}
            onChange={(e) => handleChange(question.id, question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )
    }

    return null
  }

  const isFormValid = () => {
    return questions.every((question) => {
      if (question.type === "number" && Array.isArray(question.options)) {
        // At least one number field should have a valid value
        return question.options.some((option) => {
          const value = values[option]
          return value !== "" && value !== undefined && !isNaN(Number(value)) && Number(value) >= 0
        })
      } else if (question.type === "boolean") {
        return values[question.id] === "Yes" || values[question.id] === "No"
      } else if (question.type === "select" || question.type === "choice") {
        return values[question.id] && values[question.id] !== ""
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
        {questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">{question.text}</h4>
            {renderFormFields(question)}
          </div>
        ))}
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