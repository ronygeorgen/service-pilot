"use client"

import { useState, useEffect } from "react";
import { useQuote } from "../../context/QuoteContext";

const CreateCustomServiceModal = ({ onClose, editingService  }) => {
  const { dispatch } = useQuote();
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);


  useEffect(() => {
    if (editingService) {
      setServiceName(editingService.service.name);
      setDescription(editingService.service.description);
      setPrice(editingService.calculatedPrice.toString());
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [editingService]);

  const resetForm = () => {
    setServiceName("");
    setDescription("");
    setPrice("");
    setIsEditing(false);
    setEditIndex(null);
  };


  const handleAddService = () => {
    if (!serviceName || !price) return;

    const customService = {
      service: {
        id: isEditing ? editingService.service.id : `custom-${Date.now()}`,
        name: serviceName,
        description: description,
        is_custom: true,
      },
      answers: {},
      calculatedPrice: parseFloat(price),
      selectedPricingOption: null,
    };

    if (isEditing) {
      // For edit, we need to replace the existing service
      dispatch({ type: "REMOVE_SERVICE", payload: editingService.index });
    }
    dispatch({ type: "ADD_CUSTOM_SERVICE", payload: customService });
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {isEditing ? "Edit Custom Service" : "Create Custom Service"}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name*</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Custom Window Cleaning"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Describe the service..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddService}
            disabled={!serviceName || !price}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomServiceModal;