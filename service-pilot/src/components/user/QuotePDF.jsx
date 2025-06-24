import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf',
      fontWeight: 'normal'
    },
    { 
      src: 'https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVc.ttf', 
      fontWeight: 'bold'
    }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Open Sans'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50'
  },
  subheader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3498db'
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5
  },
  contactInfo: {
    marginTop: 30,
    borderTop: '1px solid #e0e0e0',
    paddingTop: 15
  },
  serviceContainer: {
    marginBottom: 25,
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: 15
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  priceContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5
  },
  signatureContainer: {
    marginTop: 40,
    alignItems: 'center'
  },
  signatureLine: {
    borderBottom: '1px solid #000',
    width: 250,
    marginBottom: 5
  },
  signatureText: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'Helvetica'
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right'
  },
  minimumPriceNote: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 5
  },
  disclaimer: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 30,
    lineHeight: 1.3
  },
  section: {
    marginBottom: 20
  },
  questionItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: '1px solid #eee'
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  customProductItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5
  }
});

const QuotePDF = ({ 
  selectedContact, 
  selectedServices, 
  selectedPlans, 
  totalPrice, 
  signature,
  minimumPrice,
  isMinimumPriceApplied,
  customProducts = []
}) => {
  const getSelectedPlan = (service) => {
    const serviceId = service.id;
    const planId = selectedPlans[serviceId];
    const plans = generatePlans(service);
    return plans.find(plan => String(plan.id) === String(planId));
  };

  function customRound(number) {
    const decimal = number % 1;  // Get the decimal part
    const integer = Math.floor(number);  // Get the integer part
    
    if (decimal >= 0.5) {
      return integer + 1;
    } else {
      return integer;
    }
  }

  const renderQuestionDetails = (question) => {
    if (question.type === 'boolean') {
      return (
        <View style={styles.questionItem}>
          <Text style={styles.questionText}>{question.text}</Text>
          <Text>
            {question.bool_ans ? 'Yes' : 'No'}
            {question.bool_ans && question.unit_price !== '0.00' && (
              <Text> (+${parseFloat(question.unit_price || 0).toFixed(2)})</Text>
            )}
          </Text>
        </View>
      );
    }

    if (question.type === 'choice' && question.options) {
      return (
        <View style={styles.questionItem}>
          <Text style={styles.questionText}>{question.text}</Text>
          {question.options.map((option, optIndex) => (
            <View key={optIndex} style={styles.optionRow}>
              <Text>{option.label}:</Text>
              <Text>
                {option.qty} × ${option.value} = ${(parseFloat(option.value) * parseInt(option.qty || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (question.type === 'extra_choice') {
      return (
        <View style={styles.questionItem}>
          <Text style={styles.questionText}>{question.text}</Text>
          <View style={styles.optionRow}>
            <Text>
              {question.options[0]?.label 
                ? question.options[0].label.charAt(0).toUpperCase() + question.options[0].label.slice(1)
                : 'Not specified'}
            </Text>
            <Text>${question.options[0]?.value || 0}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Service Proposal</Text>
        
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 18, color: '#3498db' }}>Prepared by ServicePilot</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Our Promise</Text>
          <Text style={styles.text}>
            Thank you for considering our services. This proposal outlines the services we'll provide 
            and the associated costs. We're committed to delivering exceptional quality and value.
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.subheader}>Prepared For:</Text>
          {selectedContact ? (
            <>
              <Text style={styles.text}>
                {selectedContact.first_name} {selectedContact.last_name}
              </Text>
              {selectedContact.phone && <Text style={styles.text}>Phone: {selectedContact.phone}</Text>}
              {selectedContact.email && <Text style={styles.text}>Email: {selectedContact.email}</Text>}
            </>
          ) : (
            <Text style={styles.text}>No contact information provided</Text>
          )}
        </View>
      </Page>

      {/* Services Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Selected Services</Text>
        
        {selectedServices?.map((service, index) => {
          const selectedPlan = getSelectedPlan(service);
          
          return (
            <View key={index} style={styles.serviceContainer}>
              <Text style={styles.subheader}>
                {service.name} ({selectedPlan?.name})
              </Text>
              
              <Text style={styles.text}>{service.description}</Text>
              
              {/* Service Questions */}
              <View style={{ marginTop: 15 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Service Specifications:</Text>
                {service.questions?.map((question, qIndex) => (
                  <View key={qIndex}>
                    {renderQuestionDetails(question)}
                  </View>
                ))}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Price:</Text> ${selectedPlan?.price?.toFixed(2)}
                  {/* {selectedPlan?.discount > 0 && (
                    <Text style={{ color: '#27ae60' }}>
                      {' '}(Save {selectedPlan.discount}%)
                    </Text>
                  )} */}
                </Text>
                {/* {selectedPlan?.discount > 0 && (
                  <Text style={[styles.text, { color: '#7f8c8d', textDecoration: 'line-through' }]}>
                    Original price: ${selectedPlan?.basePrice?.toFixed(2)}
                  </Text>
                )} */}
              </View>
            </View>
          );
        })}

        {/* Custom Products Section */}
        {customProducts?.length > 0 && (
          <View style={styles.serviceContainer}>
            <Text style={styles.subheader}>Additional Products</Text>
            {customProducts.map((product, index) => (
              <View key={`product-${index}`} style={styles.customProductItem}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{product.product_name}</Text>
                {product.description && (
                  <Text style={{ marginBottom: 5 }}>{product.description}</Text>
                )}
                <Text>Price: ${product.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.totalPrice}>
          <Text>Subtotal: ${(totalPrice/ 1.0825).toFixed(2)}</Text>
          <Text>Tax (8.25%)</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>
            Total: ${(isMinimumPriceApplied 
              ? customRound(minimumPrice * 1.0825)
              : customRound(totalPrice) ).toFixed(2)} (inclusive of tax)
          </Text>
          {isMinimumPriceApplied && (
            <Text style={styles.minimumPriceNote}>
              Note: The total reflects our minimum service price of ${minimumPrice.toFixed(2)} + tax of ${(minimumPrice * 0.0825).toFixed(2)}
            </Text>
          )}
        </View>
      </Page>

      {/* Terms and Signature Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Terms and Conditions</Text>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.text, { marginBottom: 10 }]}> 
            <Text style={{ fontWeight: 'bold' }}>1. Estimate Validity:</Text> This estimate is valid for 30 calendar days from the date issued. After that period, pricing and availability are subject to change.
          </Text>
          <Text style={styles.text}>
            <Text style={{ fontWeight: 'bold' }}>2. Payment Terms:</Text> By signing below, I acknowledge that payment is due at the time of service for residential projects and within 30 days (Net 30) for commercial projects.
          </Text>
          <Text style={styles.text}>
            <Text style={{ fontWeight: 'bold' }}>3. Acceptance of Terms & Conditions:</Text> My signature confirms that I have read, understood, and agree to all TruShine Window Cleaning Terms and Conditions.
          </Text>
          <Text style={styles.text}>
            <Text style={{ fontWeight: 'bold' }}>4. Recurring Service Agreement (if applicable):</Text> If I have elected to enroll in a recurring service plan, my signature also indicates acceptance of the TruShine Recurring Service Agreement and its associated terms.
          </Text>
        </View>

        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>{signature || 'Client Signature'}</Text>
          <View style={styles.signatureLine} />
          <Text style={{ fontSize: 10, marginTop: 5 }}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.disclaimer}>
          <Text>
            This proposal is confidential and intended solely for the use of the individual or entity to whom it is addressed.
            Any unauthorized use, disclosure, or copying is strictly prohibited.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const generatePlans = (service) => {
  if (!service.pricingOptions) return [];
  
  return service.pricingOptions.map(option => {
    const priceInfo = calculatePlanPrice(option, service);
    
    return {
      id: option.id.toString(),
      name: option.name.charAt(0).toUpperCase() + option.name.slice(1),
      basePrice: priceInfo.basePrice,
      price: priceInfo.discountedPrice,
      savings: priceInfo.savings,
      discount: option.discount,
      features: option.selectedFeatures?.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description || '',
        included: feature.is_included
      })) || []
    };
  });
};

const calculatePlanPrice = (pricingOption, service) => {
  let baseTotal = 0;
  const priceBreakdown = {
    basePrice: 0,
    booleanPrices: [],
    optionPrices: [],
    extraChoicePrices: []
  };

  service.questions?.forEach(question => {
    if (question.type === 'boolean' && question.bool_ans) {
      const price = parseFloat(question.unit_price) || 0;
      baseTotal += price;
      priceBreakdown.booleanPrices.push({
        questionText: question.text,
        price: price
      });
    } 
    else if (question.type === 'choice' && question.options) {
      question.options.forEach(option => {
        const optionPrice = parseFloat(option.value) || 0;
        const quantity = parseInt(option.qty) || 0;
        const optionTotal = optionPrice * quantity;
        baseTotal += optionTotal;
        priceBreakdown.optionPrices.push({
          optionName: option.label,
          unitPrice: optionPrice,
          quantity: quantity,
          total: optionTotal
        });
      });
    }
    else if (question.type === 'extra_choice') {
      const price = parseFloat(question.options[0]?.value) || 0;
      baseTotal += price;
      priceBreakdown.extraChoicePrices.push({
        questionText: question.text,
        optionName: question.options[0]?.label,
        price: price
      });
    }
  });

  priceBreakdown.basePrice = baseTotal;
  const discount = pricingOption.discount || 0;
  const discountedPrice = baseTotal * (1 - discount / 100);
  
  return {
    basePrice: baseTotal,
    discountedPrice: discountedPrice,
    savings: baseTotal - discountedPrice,
    priceBreakdown: priceBreakdown
  };
};

export default QuotePDF;