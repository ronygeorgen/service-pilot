"use client"

import React, { createContext, useContext, useReducer } from "react"
import { calculatePrice } from "../utils/calculations"
import { defaultSettings2 } from "../data/defaultSettings2"

// Initial state
const initialState = {
  selectedServices: [],
  currentService: null,
  showPricing: false,
  selectedPricingOption: null,
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

      const price = calculatePrice(state.currentService, action.payload, settingsState)
      const selectedService = {
        service: state.currentService,
        answers: action.payload,
        calculatedPrice: price,
      }

      return {
        ...state,
        selectedServices: [...state.selectedServices, selectedService],
        showPricing: true,
      }
    }
    case "SHOW_PRICING":
      return {
        ...state,
        showPricing: true,
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
      }
    case "RESET":
      return initialState
    default:
      return state
  }
}

// Settings state management
let settingsState = defaultSettings2

export const QuoteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quoteReducer, initialState)

  const updateSettings = (newSettings) => {
    settingsState = newSettings
    localStorage.setItem("quoteWidgetSettings", JSON.stringify(newSettings))
  }

  React.useEffect(() => {
    const savedSettings = localStorage.getItem("quoteWidgetSettings")
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        settingsState = parsedSettings
      } catch (e) {
        console.error("Failed to parse saved settings:", e)
      }
    }
  }, [])

  const value = {
    state,
    settings: settingsState,
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
