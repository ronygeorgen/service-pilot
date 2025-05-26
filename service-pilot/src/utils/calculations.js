export const calculatePrice = (service, answers, settings) => {
  let price = 0

  service.questions.forEach((question) => {
    if (question.type === "number" && question.options && question.optionPrices) {
      question.options.forEach((option) => {
        const key = `${question.id}-${option}`
        const quantity = Number(answers[key] || 0)
        const unitPrice = question.optionPrices[option] || 0
        price += quantity * unitPrice
      })
    } else if (question.type === "boolean" && answers[question.id] === "Yes") {
      price += question.unitPrice || 0
    } else if (question.type === "select" && question.optionPrices) {
      const selectedOption = answers[question.id]
      if (selectedOption) {
        price += question.optionPrices[selectedOption] || 0
      }
    }
  })

  // Apply gutter size multiplier if applicable
  if (service.id === "gutter-cleaning") {
    const gutterSizeQuestion = service.questions.find((q) => q.id === "gutter-size")
    if (gutterSizeQuestion && answers[gutterSizeQuestion.id] === "6inch") {
      price *= 1.25 // 25% more for 6-inch gutters
    }
  }

  // Ensure minimum price
  price = Math.max(price, settings.minimumPrice)

  return price
}

export const applyPricingOption = (basePrice, discountPercentage) => {
  return basePrice * (1 - discountPercentage / 100)
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export const getTotalPrice = (services) => {
  return services.reduce((total, service) => total + service.calculatedPrice, 0)
}
