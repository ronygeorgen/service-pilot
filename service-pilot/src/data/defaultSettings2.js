// Default settings for the quote widget

export const defaultSettings2 = {
  pricingOptions: [
    {
      id: 1,
      name: "One-time Service",
      discount: 0,
      pricing_type: "one-time",
      is_active: true,
    },
    {
      id: 2,
      name: "Monthly Service",
      discount: 10,
      pricing_type: "monthly",
      is_active: true,
    },
    {
      id: 3,
      name: "Quarterly Service",
      discount: 15,
      pricing_type: "quarterly",
      is_active: true,
    },
    {
      id: 4,
      name: "Annual Service",
      discount: 25,
      pricing_type: "annual",
      is_active: true,
    },
  ],
  features: {
    showFeatures: true,
    showQuestions: true,
    showPricing: true,
    allowMultipleServices: true,
  },
  styling: {
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    buttonText: "Get Quote",
  },
  validation: {
    requireAllQuestions: true,
    validateEmail: true,
    validatePhone: true,
  },
}