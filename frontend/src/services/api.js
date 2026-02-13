import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches shipments with optional filters and pagination.
 * @param {Object} params - { page, pageSize, shipmentStatus }
 */
export const getShipments = async (params = {}) => {
  try {
    // Axios handles converting the params object into a query string:
    // e.g., /shipments?page=1&pageSize=20&shipmentStatus=shipped
    const response = await api.get('/shipments', { params });
    
    // We return the full data object so the frontend can access 
    // the 'shipments' array as well as pagination totals.
    return response.data;
  } catch (error) {
    console.error('Frontend API Error:', error.response?.data || error.message);
    throw error;
  }
};