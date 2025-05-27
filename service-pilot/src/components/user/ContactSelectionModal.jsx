"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react"
import { searchContacts, setSearchTerm, setCurrentPage, selectContact } from "../../features/user/contactsSlice"

const ContactSelectionModal = ({ onContactSelected }) => {
  const dispatch = useDispatch()
  const { searchResults, loading, error, currentPage, searchTerm } = useSelector((state) => state.contacts)
  const [localSearchTerm, setLocalSearchTerm] = useState("")

  useEffect(() => {
    if (searchTerm) {
      setLocalSearchTerm(searchTerm)
    }
  }, [searchTerm])

  const handleSearch = (e) => {
    e.preventDefault()
    if (localSearchTerm.trim()) {
      dispatch(setSearchTerm(localSearchTerm.trim()))
      dispatch(setCurrentPage(1))
      dispatch(searchContacts({ search: localSearchTerm.trim(), page: 1 }))
    }
  }

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
    dispatch(searchContacts({ search: searchTerm, page }))
  }

  const handleContactSelect = (contact) => {
    dispatch(selectContact(contact))
    onContactSelected(contact)
  }

  const getCurrentPageNumber = () => {
    if (!searchResults.previous && !searchResults.next) return 1
    if (!searchResults.previous) return 1
    
    // Extract page number from URL
    const urlParams = new URLSearchParams(searchResults.previous.split('?')[1])
    return parseInt(urlParams.get('page') || '1') + 1
  }

  const canGoPrevious = () => searchResults.previous !== null
  const canGoNext = () => searchResults.next !== null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Contact</h3>
        <p className="text-gray-600">Search and select a contact to create a quote</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder="Search contacts by name, email or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!localSearchTerm.trim() || loading}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            !localSearchTerm.trim() || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Found {searchResults.count} contact{searchResults.count !== 1 ? 's' : ''}
            </p>
            
            {/* Pagination Controls */}
            {(searchResults.previous || searchResults.next) && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const prevPage = getCurrentPageNumber() - 1
                    handlePageChange(prevPage)
                  }}
                  disabled={!canGoPrevious() || loading}
                  className={`p-2 rounded-md ${
                    !canGoPrevious() || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-600 px-2">
                  Page {getCurrentPageNumber()}
                </span>
                
                <button
                  onClick={() => {
                    const nextPage = getCurrentPageNumber() + 1
                    handlePageChange(nextPage)
                  }}
                  disabled={!canGoNext() || loading}
                  className={`p-2 rounded-md ${
                    !canGoNext() || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Contacts List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.results.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {contact.first_name} {contact.last_name}
                    </h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p className="truncate">{contact.email}</p>
                      <p>{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-xs text-gray-400">
                      {contact.country}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchTerm && searchResults.results.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">No contacts found for "{searchTerm}"</p>
          <p className="text-sm text-gray-400 mt-2">Try searching with different keywords</p>
        </div>
      )}

      {/* Initial State Message */}
      {!searchTerm && searchResults.results.length === 0 && !loading && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Search for contacts to get started</p>
          <p className="text-sm text-gray-400 mt-2">Enter a name, email, or phone number above</p>
        </div>
      )}
    </div>
  )
}

export default ContactSelectionModal