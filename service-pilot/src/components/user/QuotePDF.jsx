import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed (optional)
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf' },
    { src: 'https://fonts.gstatic.com/s/opensans/v27/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVc.ttf', fontWeight: 600 }
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
  section: {
    marginBottom: 20
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  subheader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  },
  contactInfo: {
    marginTop: 30,
    borderTop: '1px solid #000',
    paddingTop: 10
  },
  packageContainer: {
    fontSize: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  packageColumn: {
    width: '30%'
  },
  packageHeader: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  packageFeature: {
    padding: 5,
    borderBottom: '1px solid #f0f0f0'
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 20,
    alignSelf: 'center'
  },
  signatureLine: {
    borderBottom: '1px solid #000',
    width: 200,
    marginTop: 40
  },
  jobSpecRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 5,
  borderBottom: '1px solid #f0f0f0',
  paddingBottom: 3
}
});

const QuotePDF = ({ selectedContact, selectedServices, selectedPlans, totalPrice }) => {
  // Helper function to get selected plan for a service
  const getSelectedPlan = (service) => {
    const serviceId = service.service.id;
    const planId = selectedPlans[serviceId];
    const plans = generatePlans(service);
    return plans.find(plan => plan.id === planId);
  };

  return (
    <Document>
      {/* Page 1: Cover Page */}
      <Page size="A4" style={styles.page}>
        {/* Logo placeholder - replace with your actual logo */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Service Pilot</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Services</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>PROPOSAL FROM</Text>
          <Text style={styles.subheader}>OUR PROMISE</Text>
          <Text style={styles.text}>
            Thanks for taking the time to fill out our instant online bid. We know your time is valuable
            and our instant online bid feature is just one way we help to accommodate your schedule.
            Whether it is getting the bid done for you quickly or getting your windows cleaned right
            the first time, we have built our business in a way to prove to you that we are serious about
            your satisfaction in every way possible!
          </Text>
          <Text style={styles.text}>- Arman K</Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.subheader}>PREPARED FOR:</Text>
          {selectedContact ? (
            <>
              <Text style={styles.text}>
                {selectedContact.first_name} {selectedContact.last_name}
                {selectedContact.address ? `, ${selectedContact.address}` : ''}
                {selectedContact.city ? `, ${selectedContact.city}` : ''}
                {selectedContact.state ? `, ${selectedContact.state}` : ''}
                {selectedContact.zip ? ` ${selectedContact.zip}` : ''}
              </Text>
              {selectedContact.phone && (
                <Text style={styles.text}>Phone: {selectedContact.phone}</Text>
              )}
              {selectedContact.email && (
                <Text style={styles.text}>Email: {selectedContact.email}</Text>
              )}
            </>
          ) : (
            <Text style={styles.text}>No contact selected</Text>
          )}
        </View>
      </Page>

      {/* Page 2: Service Packages */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>YOU HAVE SELECTED THE FOLLOWING SERVICE PACKAGE:</Text>
        
        {selectedServices?.map((service, index) => {
          const serviceDetails = service?.service || {};
          const selectedPlan = getSelectedPlan(service);
          
          return (
            <View key={index} style={styles.section}>
              <Text style={styles.subheader}>
                {serviceDetails.name?.toUpperCase()} ({selectedPlan?.name?.toUpperCase()})
              </Text>
              
              <Text style={styles.subheader}>PACKAGES</Text>
              
              <View style={styles.packageContainer}>
                {generatePlans(service).map((plan) => (
                  <View key={plan.id} style={styles.packageColumn}>
                    <Text style={styles.packageHeader}>{plan.name.toUpperCase()}</Text>
                    {plan.features.map((feature, idx) => (
                      <Text key={idx} style={styles.packageFeature}>
                        {feature.name}
                      </Text>
                    ))}
                    <Text style={[styles.packageFeature, { fontWeight: 'bold', textAlign: 'center' }]}>
                      ${plan.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </Page>

      {/* Page 3: Details */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>DETAILS</Text>
        
        <Text style={styles.text}>
          Even though this bid assumes that all of the information you entered in is correct, we realize that you may have forgotten to count a window or two. If that is the case, we're happy to adjust the bid when we get there but before we begin the work. This bid includes regular cleaning practices, which doesn't include hard worker removal, razor usage, screen repair, construction cleaning, or any acid treatment of your windows. We do offer these services, but they require an extra charge and in some cases a waiver to be signed if you think any of these extenuating circumstances might be an issue on your project, let us know when we're scheduling and we'd be happy to work with you toward meeting all of your needs! We cannot be responsible for leaky windows and doors unless you let us know before work begins.
        </Text>

        {/* Add more service-specific details here */}
        {selectedServices?.map((service, index) => {
          const serviceDetails = service?.service || {};
          return (
            <View key={index} style={styles.section}>
              <Text style={styles.subheader}>{serviceDetails.name?.toUpperCase()}</Text>
              <Text style={styles.text}>{serviceDetails.description}</Text>
            </View>
          );
        })}
      </Page>

    {/* Page 4: Job Specs */}
    <Page size="A4" style={styles.page}>
    <Text style={styles.header}>JOB SPECS</Text>
    
    {selectedServices?.map((service, index) => {
        const serviceDetails = service?.service || {};
        const answers = service?.answers || {};
        
        return (
        <View key={index} style={styles.section}>
            <Text style={[styles.subheader, { marginBottom: 10 }]}>{serviceDetails.name?.toUpperCase()}</Text>
            
            
            {Object.entries(answers).map(([key, value]) => {
            const questionId = key.split('-')[0];
            const question = serviceDetails.questions?.find(q => q.id.toString() === questionId);
            
            if (question?.type === "boolean") {
                return (
                <View key={key} style={styles.jobSpecRow}>
                    <Text style={styles.text}>{question.text}:</Text>
                    <Text style={[styles.text, { fontWeight: 'semibold' }]}>
                    {value === "Yes" ? "Yes" : "No"}
                    </Text>
                </View>
                );
            }
            
            const optionLabel = key.split('-')[1];
            let displayText = question?.text || key;
            
            if (optionLabel && question) {
                displayText = `${optionLabel}`;
            } else if (question) {
                displayText = question.text;
            }

            return (
                <View key={key} style={styles.jobSpecRow}>
                <Text style={styles.text}>{displayText}:</Text>
                <Text style={[styles.text, { fontWeight: 'semibold' }]}>
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </Text>
                </View>
            );
            })}
        </View>
        );
    })}
    </Page>

      {/* Page 5: Terms and Conditions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>TERMS AND CONDITIONS</Text>
        
        <Text style={styles.text}>
          "We" or "our" or "TWC" refers to Trushine Window Cleaning Ltd. "You", "your" or "the client" refers to the customer receiving the service(s) detailed.
        </Text>

        {/* Add all your terms and conditions here */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.text}>- Any special accommodation has to be reviewed and accepted by management staff prior accepting the proposal.</Text>
          <Text style={styles.text}>- Quotations are valid for 30 days, and accepted only in writing by signature and will subject to the Terms and Conditions herein on the day of services.</Text>
          {/* Add all other terms from your sample */}
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>Total: ${totalPrice.toFixed(2)}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.text}>Client Signature</Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper function to generate plans (same as in your main component)
const generatePlans = (service) => {
  if (!service.service?.pricingOptions) return [];
  
  const optionPrices = service.calculatedPrice?.breakdown?.optionPrices || [];
  const booleanPrices = service.calculatedPrice?.breakdown?.booleanPrices || [];
  
  return service.service.pricingOptions.map(option => {
    const priceInfo = calculatePlanPrice(option, optionPrices, booleanPrices);
    
    return {
      id: option.id.toString(),
      name: option.name.charAt(0).toUpperCase() + option.name.slice(1),
      basePrice: priceInfo.basePrice,
      price: priceInfo.discountedPrice,
      savings: priceInfo.savings,
      discount: option.discount,
      features: option.selectedFeatures || []
    }
  });
};

// Helper function to calculate plan prices (same as in your main component)
const calculatePlanPrice = (pricingOption, optionPrices, booleanPrices) => {
  const optionsTotal = optionPrices.reduce((sum, option) => sum + option.total, 0);
  const booleanTotal = booleanPrices.reduce((sum, boolPrice) => sum + boolPrice.price, 0);
  const baseTotal = optionsTotal + booleanTotal;
  const discount = pricingOption.discount || 0;
  const discountedPrice = baseTotal * (1 - discount / 100);
  
  return {
    basePrice: baseTotal,
    discountedPrice: discountedPrice,
    savings: baseTotal - discountedPrice
  }
};

export default QuotePDF;