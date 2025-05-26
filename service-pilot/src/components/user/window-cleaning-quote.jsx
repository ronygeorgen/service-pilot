"use client"

import { useState, useRef } from "react"
import { Check, X, ChevronRight, ChevronUp, ChevronDown, FileText } from "lucide-react"

export default function WindowCleaningQuote() {
  const [selectedPlan, setSelectedPlan] = useState("semi-annually")
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState("about")
  const [expandedSections, setExpandedSections] = useState({
    note: false,
    photos: false,
  })
  const [signature, setSignature] = useState("")
  const scrollRef = useRef(null)

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: 14,
      color: "bg-blue-400",
      features: [
        { text: "Windows Cleaned Outside only", included: true },
        { text: "36 Hrs Streak Free Guarantee", included: true },
        { text: "$2 Million insurance protection", included: true },
        { text: "$100 Pressure Washing Gift Certificate", included: true },
        { text: "$100 Gutter Cleaning Gift Certificate", included: true },
        { text: "1 Free Touch-up per month", included: true },
        { text: "Paint scraping and decal residue", included: true },
        { text: "Hard water stain removal", included: true },
      ],
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: 16,
      color: "bg-blue-400",
      features: [
        { text: "Windows Cleaned Outside only", included: true },
        { text: "36 Hrs Streak Free Guarantee", included: true },
        { text: "$2 Million insurance protection", included: true },
        { text: "$100 Pressure Washing Gift Certificate", included: true },
        { text: "$100 Gutter Cleaning Gift Certificate", included: true },
        { text: "1 Free Touch-up per month", included: true },
        { text: "Paint scraping and decal residue", included: false },
        { text: "Hard water stain removal", included: false },
      ],
    },
    {
      id: "semi-annually",
      name: "Semi Annually",
      price: 17,
      color: "bg-green-500",
      features: [
        { text: "Windows Cleaned Outside only", included: true },
        { text: "36 Hrs Streak Free Guarantee", included: true },
        { text: "$2 Million insurance protection", included: true },
        { text: "$100 Pressure Washing Gift Certificate", included: true },
        { text: "$100 Gutter Cleaning Gift Certificate", included: true },
        { text: "1 Free Touch-up per month", included: true },
        { text: "Paint scraping and decal residue", included: false },
        { text: "Hard water stain removal", included: false },
      ],
    },
  ]

  const steps = [
    { id: 0, color: "bg-blue-500" },
    { id: 1, color: "bg-blue-500" },
    { id: 2, color: "bg-green-500" },
    { id: 3, color: "bg-gray-400" },
  ]

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const scrollPlans = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const selectedPlanData = plans.find((plan) => plan.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gray-200 pb-20">
      {/* Header Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 pt-6 pb-4">
        <div className="text-center px-4">
          <div className="mb-6">
            <img src="/placeholder.svg?height=120&width=120" alt="Tru Shine Logo" className="mx-auto h-16 w-16" />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">PREPARED FOR:</h2>
            <p className="text-base font-medium">test test</p>
            <p className="text-gray-600 text-sm">1146 South Waukegan Road ,</p>
            <p className="text-gray-600 text-sm">Barker, TX 60085</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Which of These Services Would You Like?</h3>
            <p className="text-gray-600 mb-2 text-sm">
              The prices shown are quotes based on the info you gave us, but will need to be confirmed.
            </p>
            <a href="#" className="text-blue-500 hover:underline text-sm">
              Get another service quote
            </a>
          </div>
        </div>
      </div>

      {/* Window Cleaning Video Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="px-4">
          <h3 className="text-xl font-semibold text-center mb-4">Window Cleaning</h3>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-0 h-0 border-l-6 border-l-white border-t-3 border-t-transparent border-b-3 border-b-transparent ml-1"></div>
                </div>
                <p className="text-sm">Video Player</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details and Pricing Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="px-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Even though this bid assumes that all of the information you entered in is correct, we realize that you may
              have forgotten to count a window or two. If that is the case, we're happy to adjust the bid when we get
              there but before we begin the work. This bid includes regular cleaning practices, which doesn't include hard
              water removal, razor usage, screen repair, construction cleaning, or any acid treatment of your windows. We
              do offer these services, but they require an extra charge and in some cases a waiver to be signed. If you
              think any of these extenuating circumstances might be an issue on your project, let us know when we're
              scheduling and we'd be happy to work with you toward meeting all of your needs! We cannot be responsible for
              leaky windows and doors unless you let us know before work begins.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2.5 h-2.5 rounded-full ${index === 2 ? "bg-green-500" : "bg-blue-500"}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Pricing Plans with Horizontal Scroll */}
          <div className="relative mb-6">
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white border rounded-lg overflow-hidden flex-shrink-0 w-72">
                  <div className={`${plan.color} text-white text-center py-3`}>
                    <h4 className="text-base font-semibold">{plan.name}</h4>
                  </div>

                  <div className="p-4">
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          {feature.included ? (
                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${feature.included ? "text-gray-800" : "text-gray-400"}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-center">
                      <div className="text-xl font-bold mb-1">${plan.price}</div>
                      <div className="text-gray-500 text-xs mb-3">Plus Tax</div>

                      {selectedPlan === plan.id ? (
                        <div className="bg-green-500 text-white py-2 px-4 rounded flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPlan(plan.id)}
                          className="bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 transition-colors text-sm"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrow - positioned higher */}
            <div className="flex justify-end mt-2">
              <button 
                onClick={scrollPlans}
                className="bg-blue-500 text-white p-2.5 rounded-full hover:bg-blue-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Learn More Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="px-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-3">Learn more about us!</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Below is some information about our company, along with an overview of the information you provided during
              the quoting process.
            </p>
            <a href="#" className="text-blue-500 hover:underline flex items-center justify-center space-x-2 text-sm">
              <FileText className="w-4 h-4 text-red-500" />
              <span>Download PDF</span>
            </a>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "about" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                About Company
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "specs" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Job Specs
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "about" && (
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <img src="/placeholder.svg?height=150&width=150" alt="Company Logo" className="h-24 w-24" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 leading-relaxed text-sm">
                  Thanks for taking the time to fill out our instant online bid. We know your time is valuable and our
                  instant online bid feature is just one way we help to accommodate your schedule. Whether it is getting
                  the bid done for you quickly or getting your windows cleaned right the first time, we have built our
                  business in a way to prove to you that we are serious about your satisfaction in every way possible!
                </p>
                <p className="text-gray-600 mt-3 text-sm">- Arman K</p>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-3">Disclaimer</h4>
            <div className="text-xs text-gray-600 space-y-3">
              <div>
                <p className="font-medium">Terms and Conditions</p>
                <p>
                  "We" or "our" or "TWC" refers to Trushine Window Cleaning Ltd. "You", "your" or "the client" refers to
                  the customer receiving the service(s) detailed.
                </p>
              </div>

              <p>
                – Any special accommodation has to be reviewed and accepted by management staff prior accepting the
                proposal.
              </p>
              <p>
                – Quotations are valid for 30 days, and accepted only in writing by signature and will subject to the
                Terms and Conditions herein on the day of services.
              </p>
              <p>
                – All work shall be completed in workmanship like manner, and if applicable, in compliance with all
                building codes and other applicable laws.
              </p>
              <p>
                – TWC warrants that it is adequately insured for injury to its employees and other incurring loss of
                injury as a result of the acts of its employees.
              </p>
              <p>
                – TWC reserves the right to change these terms and conditions at any time without prior notice. In the
                event that any changes are made, the revised terms and conditions shall be posted on the website
                immediately.
              </p>

              <div className="mt-4">
                <p className="font-medium">WINDOWS:</p>
                <p>
                  – All windows must be closed on day of service. Any open windows which cannot be closed will not be
                  washed.
                </p>
                <p>
                  – You must ensure that all items to be cleaned are structurally sound prior to cleaning; Trushine Window
                  Cleaning LTD reserves the right to photograph and/or notate any areas not structurally sound, and will
                  notify the client prior to services being performed.
                </p>
                <p>
                  – Full access is required on the day of the clean/repair. We are unable to move any obstacles which may
                  inhibit cleaning or repair. Should partial access on the scheduled day reduce the extent of the
                  clean/repair, we reserve the right to charge for a percentage of the windows/repair completed. If no
                  access is available the day of the scheduled clean/repair, a $100 trip fee charge will be incurred.
                </p>
                <p>– We will not clean any windows we consider to be inaccessible or unsafe on the day of the clean.</p>
                <p>
                  – External glass surfaces will usually be washed with pure water from water fed poles, and will be left
                  to dry naturally.
                </p>
                <p>
                  – A window or door is defined as any part which consists of frame, sill, sash and glass, made of wood,
                  aluminium, steel or UPVC.
                </p>
                <p>
                  – Sills made of brick, tile, stone, or any material other than listed above (wood, aluminium, steel or
                  UPVC) may damage our brushes, and will not be washed.
                </p>
                <p>
                  – Please note that any gift certificates received for window cleaning cannot be applied towards your
                  recurring service agreement. However, you are welcome to use them for interior window cleaning services.
                </p>
                <p>– TWC has 36 Hours Streak FREE Guarantee on all of our window cleaning packages.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Booking Section */}
      <div className="bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 py-6">
        <div className="px-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4 text-sm">
              Please review the details below to confirm that we got everything right, and then we'll go ahead and book
              you in.
            </p>

            <h3 className="text-lg font-semibold mb-4">You've chosen the following services:</h3>

            <div className="flex justify-between items-center py-3 border-b">
              <div className="text-left">
                <span className="text-blue-500 font-medium text-sm">WINDOW CLEANING (SEMI ANNUALLY)</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">${selectedPlanData?.price}</span>
                <span className="text-gray-500 text-sm ml-2">X</span>
                <div className="text-gray-500 text-xs">Plus Tax</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 font-bold text-base">
              <span>TOTAL</span>
              <span>${selectedPlanData?.price}</span>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-3 mb-6">
            <div className="border border-blue-300 rounded">
              <button
                onClick={() => toggleSection("note")}
                className="w-full flex justify-between items-center p-3 text-blue-500 hover:bg-blue-50 text-sm"
              >
                <span>LEAVE A NOTE</span>
                {expandedSections.note ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.note && (
                <div className="p-3 border-t">
                  <textarea
                    className="w-full h-20 p-2 border rounded resize-none text-sm"
                    placeholder="Leave a note for the service team..."
                  ></textarea>
                </div>
              )}
            </div>

            <div className="border border-blue-300 rounded">
              <button
                onClick={() => toggleSection("photos")}
                className="w-full flex justify-between items-center p-3 text-blue-500 hover:bg-blue-50 text-sm"
              >
                <span>UPLOAD PHOTOS</span>
                {expandedSections.photos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.photos && (
                <div className="p-3 border-t">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm">Click to upload photos or drag and drop</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signature Section */}
          <div className="mb-6">
            <h4 className="text-base font-semibold mb-3">Please leave your signature below</h4>
            <div className="border-b-2 border-gray-300 pb-2 mb-4">
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Your signature"
                className="w-full text-center text-base italic focus:outline-none"
              />
            </div>
          </div>

          {/* Final Button */}
          <div className="text-center">
            <button className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors font-medium text-sm">
              I'm Ready to Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white py-3 px-4 flex justify-between items-center z-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Your selection:</span>
          <div className="bg-white text-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            1
          </div>
        </div>
        <button className="text-white hover:text-gray-200">
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}