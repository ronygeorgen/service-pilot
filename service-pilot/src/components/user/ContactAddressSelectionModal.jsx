"use client"

import { MapPin, ChevronLeft } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAddresses } from "../../features/user/contactsSlice"

const ContactAddressSelectionModal = ({ contact, onAddressSelected, onBack }) => {

  const dispatch = useDispatch();
  const {selectedContactsAddresses, selectedContact} = useSelector(state=>state.contacts)

 
  
console.log(contact, selectedContact, 'ji');


  useEffect(()=>{
    console.log(selectedContact, 'ldkd  ');
    
    dispatch(getAddresses(selectedContact?.id));
  },[selectedContact])

  if (!selectedContact || !selectedContactsAddresses || selectedContactsAddresses.length === 0) {
    return (
      <div className="text-center py-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-blue-600 flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No addresses found for this contact.</p>
        <button
          onClick={()=>{onAddressSelected('not')}}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-blue-600 flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1 text-center">
          <h3 className="text-xl font-semibold text-gray-800">Select Address</h3>
          <p className="text-gray-600 text-sm">
            For {selectedContact.first_name} {selectedContact.last_name}
          </p>
        </div>
      </div>

      {/* Address List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {selectedContactsAddresses.map((address) => (
          <div
            key={address.id}
            onClick={() => onAddressSelected(address)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {address?.name || 'Unnamed Address'}
                </p>
                <p className="text-sm text-gray-500">
                  {address?.street_address}, {address?.city}, {address?.state? address?.state:'state' }, {address?.postal_code}
                </p>
                {/* {address?.postal_code && (
                  <p className="text-sm text-gray-400">postal code: {address?.postal_code}</p>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContactAddressSelectionModal
