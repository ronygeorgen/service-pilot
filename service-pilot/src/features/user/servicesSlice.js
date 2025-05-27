// store/slices/servicesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';


export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/data/api/services');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch services';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    selectService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectService, clearSelectedService, clearError } = servicesSlice.actions;
export default servicesSlice.reducer;