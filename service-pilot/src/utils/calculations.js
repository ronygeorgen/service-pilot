// Utility functions for price calculations

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const calculatePrice = (service, answers, settings) => {
  let basePrice = parseFloat(service.minimum_price) || 0
  
  // Add prices from question answers
  if (service.questions && answers) {
    service.questions.forEach((question) => {
      const questionPrice = parseFloat(question.unit_price) || 0
      
      if (question.type === "boolean" && answers[question.id] === "Yes") {
        basePrice += questionPrice
      } else if (question.type === "choice" && answers[question.id]) {
        basePrice += questionPrice
      } else if (question.type === "number" && Array.isArray(question.options)) {
        question.options.forEach((option) => {
          const key = `${question.id}-${option}`
          const value = parseFloat(answers[key]) || 0
          basePrice += value * questionPrice
        })
      }
    })
  }
  
  return basePrice
}

export const applyPricingOption = (basePrice, discountPercentage) => {
  const discount = (discountPercentage || 0) / 100
  return basePrice * (1 - discount)
}

export const calculateTotalPrice = (services, pricingOption) => {
  const baseTotal = services.reduce((total, service) => total + service.calculatedPrice, 0)
  return applyPricingOption(baseTotal, pricingOption?.discount || 0)
}