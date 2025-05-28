import { useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const { state } = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Purchase Successful!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you, {state?.contactName || 'customer'}, for your purchase. 
          We'll be in touch shortly to schedule your services.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
          <div className="space-y-2">
            {state?.services?.map((service, index) => (
              <div key={index} className="flex justify-between">
                <span>{service.name} ({service.plan})</span>
                <span>${service.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${state?.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}