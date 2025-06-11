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
  }
});

const QuotePDF = ({ 
  selectedContact, 
  selectedServices, 
  selectedPlans, 
  totalPrice, 
  signature,
  minimumPrice,
  isMinimumPriceApplied 
}) => {
  const getSelectedPlan = (service) => {
    const serviceId = service.id;
    const planId = selectedPlans[serviceId];
    const plans = generatePlans(service);
    return plans.find(plan => String(plan.id) === String(planId));
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
              {selectedContact.address && <Text style={styles.text}>{selectedContact.address}</Text>}
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
              
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Includes:</Text>
                {selectedPlan?.features?.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Text style={{ marginRight: 5 }}>{feature.included ? '✓' : '✗'}</Text>
                    <Text>{feature.name}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Price:</Text> ${selectedPlan?.price?.toFixed(2)}
                  {selectedPlan?.discount > 0 && (
                    <Text style={{ color: '#27ae60' }}>
                      {' '}(Save {selectedPlan.discount}%)
                    </Text>
                  )}
                </Text>
                {selectedPlan?.discount > 0 && (
                  <Text style={[styles.text, { color: '#7f8c8d', textDecoration: 'line-through' }]}>
                    Original price: ${selectedPlan?.basePrice?.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.totalPrice}>
          <Text>Total: ${totalPrice.toFixed(2)}</Text>
          {isMinimumPriceApplied && (
            <Text style={styles.minimumPriceNote}>
              Note: The total reflects our minimum service price of ${minimumPrice.toFixed(2)} to ensure quality service.
            </Text>
          )}
        </View>
      </Page>

      {/* Terms and Signature Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Terms and Conditions</Text>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.text}>
            1. This proposal is valid for 30 days from the date of issue.
          </Text>
          <Text style={styles.text}>
            2. Payment terms are net 15 days from date of invoice.
          </Text>
          <Text style={styles.text}>
            3. Any changes to the scope of work may result in additional charges.
          </Text>
          <Text style={styles.text}>
            4. We reserve the right to modify these terms with prior written notice.
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
      features: option.selectedFeatures.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description || '',
        included: feature.is_included
      }))
    };
  });
};

const calculatePlanPrice = (pricingOption, service) => {
  let baseTotal = 0;
  const priceBreakdown = {
    basePrice: 0,
    booleanPrices: [],
    optionPrices: []
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