"use client"

import React, { createContext, useState, useContext, useReducer } from "react"
import { calculatePrice } from "../utils/calculations"
import { defaultSettings2 } from "../data/defaultSettings2"

// Initial state
const initialState = {
  selectedServices: [],
  currentService: null,
  showPricing: false,
  selectedPricingOption: null,
  answers: {},
}

const QuoteContext = createContext(undefined)

const quoteReducer = (state, action) => {
  switch (action.type) {
    case "SELECT_SERVICE":
      return {
        ...state,
        currentService: action.payload,
        showPricing: false,
      }
    case "SET_ANSWERS": {
      if (!state.currentService) return state

      const newState = {
        ...state,
        answers: action.payload,
      }

      return newState
    }
    case "SHOW_PRICING": {
      if (!state.currentService || !state.answers) return state

      // Calculate price when showing pricing
      const price = calculatePrice(state.currentService, state.answers, defaultSettings2)
      const selectedService = {
        service: state.currentService,
        answers: state.answers,
        calculatedPrice: price,
      }

      return {
        ...state,
        selectedServices: [...state.selectedServices, selectedService],
        showPricing: true,
      }
    }
    case "SELECT_PRICING_OPTION":
      return {
        ...state,
        selectedPricingOption: action.payload,
      }
    case "ADD_MORE_SERVICES":
      return {
        ...state,
        currentService: null,
        showPricing: false,
        selectedPricingOption: null,
        answers: {},
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