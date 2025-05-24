import React, { useState } from 'react'

function AdminPanel() {
    const [ settings, updateSettings ] = useState([]);
    const [localSettings, setLocalSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('services');
    const [editingService, setEditingService] = useState(null);

    const handleSaveSettings = () => {
    updateSettings(localSettings);
    alert('Settings saved successfully!');
  };

  const handleChangeMinimumPrice = (value) => {
    const price = Number(value);
    if (!isNaN(price)) {
      setLocalSettings({
        ...localSettings,
        minimumPrice: price,
      });
    }
  };

  const handleAddService = () => {
    const newService = {
      id: `service-${Date.now()}`,
      name: 'New Service',
      questions: [],
    };
    
    setLocalSettings({
      ...localSettings,
      services: [...localSettings.services, newService],
    });
    }

  const handleDeleteService = (serviceId) => {
    setLocalSettings({
      ...localSettings,
      services: localSettings.services.filter(s => s.id !== serviceId),
    });
    
    if (editingService?.id === serviceId) {
      setEditingService(null);
    }
  };

  const handleUpdateService = (updatedService) => {
    setLocalSettings({
      ...localSettings,
      services: localSettings.services.map(s => 
        s.id === updatedService.id ? updatedService : s
      ),
    });
    
    setEditingService(updatedService);
  };

  const handleAddQuestion = () => {
    if (!editingService) return;
    
    const newQuestion = {
      id: `question-${Date.now()}`,
      text: 'New Question',
      type: 'number',
      unitPrice: 0,
    };
    
    const updatedService = {
      ...editingService,
      questions: [...editingService.questions, newQuestion],
    };
    
    handleUpdateService(updatedService);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Quote Widget Settings</h1>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {/* <Save size={18} /> */}
          Save Changes
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-5 font-medium ${
              activeTab === 'services' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600'
            }`}
          >
            Services & Questions
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-5 font-medium ${
              activeTab === 'pricing' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600'
            }`}
          >
            Pricing Options
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'services' ? (
            <div className="flex gap-8">
              {/* Service List */}
              <div className="w-1/3 border-r pr-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Services</h2>
                  <button
                    onClick={handleAddService}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    {/* <Plus size={20} /> */}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {localSettings.services?.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => setEditingService(service)}
                      className={`p-3 rounded cursor-pointer flex justify-between items-center ${
                        editingService?.id === service.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{service.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Global Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Price ($)
                    </label>
                    <input
                      type="number"
                      value={localSettings.minimumPrice}
                    //   onChange={(e) => handleChangeMinimumPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The minimum price for any service
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Question Editor */}
              <div className="w-2/3">
                {editingService ? (
                  <div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={editingService.name}
                        // onChange={(e) => handleUpdateService({
                        //   ...editingService,
                        //   name: e.target.value
                        // })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
                      <button
                        // onClick={handleAddQuestion}
                        className="flex items-center gap-1 text-sm py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        <Plus size={16} />
                        Add Question
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {editingService.questions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <button
                            //   onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Text
                              </label>
                              <input
                                type="text"
                                value={question.text}
                                // onChange={(e) => handleUpdateQuestion(
                                //   question.id, 
                                //   { text: e.target.value }
                                // )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Type
                              </label>
                              <select
                                value={question.type}
                                // onChange={(e) => handleUpdateQuestion(
                                //   question.id,
                                //   { type: e.target.value as 'number' | 'select' | 'boolean' }
                                // )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="number">Number</option>
                                <option value="select">Select (Dropdown)</option>
                                <option value="boolean">Yes/No</option>
                              </select>
                            </div>
                            
                            {(question.type === 'number' || question.type === 'select') && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Options (comma separated)
                                </label>
                                <input
                                  type="text"
                                  value={question.options?.join(', ') || ''}
                                //   onChange={(e) => handleUpdateQuestion(
                                //     question.id,
                                //     { options: e.target.value.split(',').map(o => o.trim()) }
                                //   )}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={question.type === 'number' ? "Small, Medium, Large" : "Option 1, Option 2"}
                                />
                              </div>
                            )}
                            
                            {question.type === 'boolean' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Unit Price ($)
                                </label>
                                <input
                                  type="number"
                                  value={question.unitPrice || 0}
                                //   onChange={(e) => handleUpdateQuestion(
                                //     question.id,
                                //     { unitPrice: Number(e.target.value) }
                                //   )}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Price when answered "Yes"
                                </p>
                              </div>
                            )}
                            
                            {(question.type === 'number' || question.type === 'select') && question.options && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Option Prices
                                </label>
                                <div className="space-y-3">
                                  {question.options.map(option => (
                                    <div key={option} className="flex items-center gap-3">
                                      <span className="text-sm text-gray-600 w-1/3">{option}</span>
                                      <div className="flex-1">
                                        <input
                                          type="number"
                                          value={question.optionPrices?.[option] || 0}
                                        //   onChange={(e) => handleUpdateOptionPrice(
                                        //     question.id,
                                        //     option,
                                        //     Number(e.target.value)
                                        //   )}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="0"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  Set individual prices for each option
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="text-center">
                      <p className="text-gray-500">Select a service to edit its questions</p>
                      <button
                        // onClick={handleAddService}
                        className="mt-2 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      >
                        {/* <Plus size={16} /> */}
                        Add New Service
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Pricing Options</h2>
                <button
                //   onClick={handleAddPricingOption}
                  className="flex items-center gap-1 text-sm py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus size={16} />
                  Add Option
                </button>
              </div>
              
              <div className="space-y-4">
                {localSettings.pricingOptions.map(option => (
                  <div key={option.id} className="flex gap-4 items-center border border-gray-200 rounded-lg p-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option Name
                      </label>
                      <input
                        type="text"
                        value={option.name}
                        // onChange={(e) => handleUpdatePricingOption(
                        //   option.id,
                        //   { name: e.target.value }
                        // )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={option.discount}
                        // onChange={(e) => handleUpdatePricingOption(
                        //   option.id,
                        //   { discount: Number(e.target.value) }
                        // )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-end h-full pb-1">
                      <button
                        
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
