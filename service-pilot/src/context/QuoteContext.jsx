"use client"

import React, { createContext, useState, useContext, useReducer } from "react"
import { calculateServicePrice as calculatePrice } from "../utils/calculations"
import { defaultSettings2 } from "../data/defaultSettings2"

// Initial state
const initialState = {
  selectedServices: [],
  currentService: null,
  showPricing: false,
  selectedPricingOption: null,
  answers: {},
  showSummary: false,
}

const QuoteContext = createContext(undefined)

const quoteReducer = (state, action) => {
  console.log('Reducer action:', action.type, action.payload)
  
  switch (action.type) {
    case "SELECT_SERVICE":
      return {
        ...state,
        currentService: action.payload,
        showPricing: false,
        showSummary: false,
        answers: {}, // Reset answers when selecting new service
        selectedPricingOption: null, // Reset pricing option
      }
    case "SET_ANSWERS": {
      if (!state.currentService) return state

      console.log('Setting answers:', action.payload)

      const newState = {
        ...state,
        answers: action.payload,
      }

      return newState
    }
    case "SHOW_PRICING": {
      if (!state.currentService || !state.answers) return state

      console.log('Showing pricing for service:', state.currentService.name)
      console.log('With answers:', state.answers)

      // Calculate price when showing pricing
      const priceData = calculatePrice(state.currentService, state.answers, defaultSettings2)
      console.log('Calculated price data:', priceData)
      
      const selectedService = {
        service: state.currentService,
        answers: { ...state.answers }, // Create a copy of answers
        calculatedPrice: priceData,
        selectedPricingOption: null,
      }

      return {
        ...state,
        selectedServices: [...state.selectedServices, selectedService],
        showPricing: true,
        showSummary: false,
      }
    }
    case "SELECT_PRICING_OPTION":
      return {
        ...state,
        // Update the pricing option for the last selected service
        selectedServices: state.selectedServices.map((service, index) => 
          index === state.selectedServices.length - 1 
            ? { ...service, selectedPricingOption: action.payload }
            : service
        ),
        selectedPricingOption: action.payload,
      }
    case "SHOW_SUMMARY":
      return { 
        ...state, 
        showSummary: true,
        showPricing: false,
        currentService: null,
      }
    case "ADD_MORE_SERVICES":
      return {
        ...state,
        currentService: null,
        showPricing: false,
        selectedPricingOption: null,
        answers: {},
        showSummary: false,
      }
    case "GO_BACK_TO_QUESTIONS":
      return { 
        ...state, 
        showPricing: false,
        showSummary: false,
        selectedPricingOption: null,
        // Remove the last selected service since we're going back
        selectedServices: state.selectedServices.slice(0, -1),
      }
    case "RESET":
      return initialState
    default:
      return state
  }
}

export const QuoteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quoteReducer, initialState)
  const [settings, setSettings] = useState(defaultSettings2)

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
  }

  const value = {
    state,
    settings,
    dispatch,
    updateSettings,
  }

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
}

export const useQuote = () => {
  const context = useContext(QuoteContext)
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider")
  }
  return context
}