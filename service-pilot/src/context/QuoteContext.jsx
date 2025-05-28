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
  finalizedQuote: null,
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
    case "SET_ANSWERS":
      return {
        ...state,
        answers: action.payload,
      };

    case "SHOW_PRICING": {
      if (!state.currentService || !state.answers) return state;

      const priceData = calculatePrice(state.currentService, state.answers, defaultSettings2);
      
      // Check if this service already exists in selectedServices
      const existingServiceIndex = state.selectedServices.findIndex(
        service => service.service.id === state.currentService.id
      );

      const newService = {
        service: state.currentService,
        answers: { ...state.answers },
        calculatedPrice: priceData,
        selectedPricingOption: null,
      };

      let updatedSelectedServices;
      if (existingServiceIndex >= 0) {
        // Update existing service
        updatedSelectedServices = [...state.selectedServices];
        updatedSelectedServices[existingServiceIndex] = newService;
      } else {
        // Add new service
        updatedSelectedServices = [...state.selectedServices, newService];
      }

      return {
        ...state,
        selectedServices: updatedSelectedServices,
        showPricing: true,
        showSummary: false,
      };
    }
    case "SELECT_PRICING_OPTION": {
      // Find the index of the current service (last one in the array)
      const currentIndex = state.selectedServices.length - 1;
      if (currentIndex < 0) return state;
      
      return {
        ...state,
        selectedServices: state.selectedServices.map((service, index) => 
          index === currentIndex 
            ? { ...service, selectedPricingOption: action.payload }
            : service
        ),
        selectedPricingOption: action.payload,
      };
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
    case "FINALIZE_QUOTE":
      return {
        ...state,
        finalizedQuote: {
          ...action.payload,
          selectedServices: state.selectedServices, // Keep selected services
        },
        showSummary: false,
        currentService: null,
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