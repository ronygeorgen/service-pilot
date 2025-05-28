// utils/calculations.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const applyPricingOption = (basePrice, discountPercentage) => {
  if (!discountPercentage || discountPercentage === 0) {
    return basePrice
  }
  const discountAmount = (basePrice * discountPercentage) / 100
  return basePrice - discountAmount
}

export const calculateSavings = (originalPrice, discountPercentage) => {
  if (!discountPercentage || discountPercentage === 0) {
    return 0
  }
  return (originalPrice * discountPercentage) / 100
}

export const calculateServicePrice = (service, answers) => {
  console.log('calculateServicePrice called with:', { service, answers })
  
  let totalPrice = 0
  const breakdown = {
    basePrice: 0,
    optionPrices: [],
    booleanPrices: [],
    selectedAnswers: [], // Track all selected answers for display
    total: 0
  }

  // Validate inputs
  if (!service || !service.questions || !answers) {
    console.warn('Invalid service or answers provided')
    return { total: 0, breakdown }
  }

  // Process each question
  service.questions.forEach(question => {
    console.log('Processing question:', question)
    
    if ((question.type === "choice" || question.type === "number") && Array.isArray(question.options)) {
      // Handle choice/number type questions with options
      question.options.forEach(optionObj => {
        const label = Object.keys(optionObj)[0]
        const priceStr = optionObj[label]
        const price = parseFloat(priceStr) || 0
        const key = `${question.id}-${label}`
        const quantityStr = answers[key]
        const quantity = parseInt(quantityStr) || 0
        
        console.log('Option processing:', {
          label,
          priceStr,
          price,
          key,
          quantityStr,
          quantity,
          answerValue: answers[key]
        })
        
        if (quantity > 0) {
          const optionTotal = price * quantity
          totalPrice += optionTotal
          
          breakdown.optionPrices.push({
            optionName: label,
            unitPrice: price,
            quantity: quantity,
            total: optionTotal
          })
          
          console.log('Added option to total:', {
            optionName: label,
            unitPrice: price,
            quantity: quantity,
            total: optionTotal,
            runningTotal: totalPrice
          })
        }
      })
    } else if (question.type === "boolean") {
      // Handle boolean type questions
      const answer = answers[question.id]
      // Handle both string and number unit_price
      const unitPriceStr = question.unit_price || "0"
      const unitPrice = parseFloat(unitPriceStr) || 0
      
      console.log('Boolean processing:', {
        questionId: question.id,
        questionText: question.text,
        answer,
        unitPriceStr,
        unitPrice,
        answerType: typeof answer
      })
      
      // Check if the answer is "Yes"
      if (answer === "Yes") {
        // Add to selected answers for display purposes
        breakdown.selectedAnswers.push({
          questionText: question.text,
          answer: answer,
          price: unitPrice,
          hasCharge: unitPrice > 0
        })
        
        // Only add to total price if there's a charge
        if (unitPrice > 0) {
          totalPrice += unitPrice
          
          breakdown.booleanPrices.push({
            questionText: question.text,
            price: unitPrice
          })
          
          console.log('Added boolean price to total:', {
            questionText: question.text,
            price: unitPrice,
            runningTotal: totalPrice
          })
        } else {
          console.log('Boolean question selected but has no charge:', {
            questionText: question.text,
            price: unitPrice
          })
        }
      } else {
        console.log('Boolean question skipped:', {
          reason: answer !== "Yes" ? `Answer is "${answer}", not "Yes"` : `Unit price is ${unitPrice}, not > 0`
        })
      }
    }
  })

  breakdown.total = totalPrice
  
  console.log('Final calculation result:', {
    totalPrice,
    breakdown,
    serviceMinimum: service.minimum_price
  })
  
  return {
    total: totalPrice,
    breakdown: breakdown
  }
}