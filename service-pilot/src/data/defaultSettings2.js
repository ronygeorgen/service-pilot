export const defaultSettings2 = {
  minimumPrice: 125,
  services: [
    {
      id: "window-cleaning",
      name: "Window Cleaning",
      questions: [
        {
          id: "window-panes",
          text: "How many panes?",
          type: "number",
          options: ["Small", "Medium", "Large", "Sun screens"],
          optionPrices: {
            Small: 5,
            Medium: 8,
            Large: 12,
            "Sun screens": 7,
          },
        },
        {
          id: "storm-windows",
          text: "Do you have storm windows?",
          type: "boolean",
          unitPrice: 20,
        },
      ],
    },
    {
      id: "gutter-cleaning",
      name: "Gutter Cleaning",
      questions: [
        {
          id: "gutter-feet",
          text: "How many linear feet of gutter do you want us to clean?",
          type: "number",
          options: ["Linear feet of gutter", "Number of Downspouts"],
          optionPrices: {
            "Linear feet of gutter": 2,
            "Number of Downspouts": 10,
          },
        },
        {
          id: "gutter-size",
          text: "What is the size of the gutter?",
          type: "select",
          options: ["5inch", "6inch"],
          optionPrices: {
            "5inch": 0,
            "6inch": 0,
          },
        },
      ],
    },
  ],
  pricingOptions: [
    {
      id: "monthly",
      name: "Monthly",
      discount: 25,
    },
    {
      id: "quarterly",
      name: "Quarterly",
      discount: 15,
    },
    {
      id: "semi-annual",
      name: "Semi Annually",
      discount: 10,
    },
    {
      id: "one-time",
      name: "1 Time Service",
      discount: 0,
    },
  ],
}
