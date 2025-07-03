import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';

// Async thunk for searching contacts
export const searchContacts = createAsyncThunk(
  'contacts/searchContacts',
  async ({ search, page = 1 }, { rejectWithValue }) => {
    try {
      const url = `/data/contacts/search/?search=${encodeURIComponent(search)}&page=${page}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to search contacts';
      return rejectWithValue(message);
    }
  }
);

export const getAddresses = createAsyncThunk(
  'contacts/getAddresses',
  async (contact_id, { rejectWithValue }) => {
    try {
      const url = `/data/address/by-contact/${contact_id}/`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to search contacts';
      return rejectWithValue(message);
    }
  }
);


const initialState = {
  contacts: [],
  selectedContact: null,
  selectedContactsAddresses:[],
  searchResults: {
    count: 0,
    next: null,
    previous: null,
    results: [],
  },
  currentPage: 1,
  searchTerm: '',
  loading: false,
  error: null,
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    selectContact: (state, action) => {
      console.log(action.payload, 'payload');
      
      state.selectedContact = action.payload;
    },
    clearSelectedContact: (state) => {
      state.selectedContact = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
      state.currentPage = 1;
      state.searchTerm = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedContactsAddresses = action.payload;
      })
      .addCase(getAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectContact,
  clearSelectedContact,
  setSearchTerm,
  setCurrentPage,
  clearSearchResults,
  clearError,
} = contactsSlice.actions;

export default contactsSlice.reducer;