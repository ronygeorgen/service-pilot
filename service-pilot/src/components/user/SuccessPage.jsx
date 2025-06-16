import { useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function SuccessPage() {
  const { state } = useLocation();

  useEffect(() => {
    // Load the form embed script
    const script = document.createElement('script');
    script.src = 'https://api.leadconnectorhq.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center"> {/* Changed max-w-md to max-w-2xl */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Quote Accepted!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you, {state?.contactName || 'customer'}, for your purchase. 
          Please schedule your appointment below.
        </p>

        {/* Calendar Embed */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Schedule Your Service</h2>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200">
            <iframe src="https://api.leadconnectorhq.com/widget/booking/1rwE7cUSN5MxPeI1CHiB" style="width: 100%;border:none;overflow: hidden;" scrolling="no" id="1rwE7cUSN5MxPeI1CHiB_1750084425977"></iframe>  
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
          <div className="space-y-2">
            {state?.services?.map((service, index) => (
              <div key={index} className="flex justify-between">
                <span>{service.name} ({service.plan})</span>
                <span>${service.price}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${state?.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        
      </div>
    </div>
  );
}