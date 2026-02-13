import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches unfulfilled orders (Awaiting Shipment).
 * Use this to access the 1,000+ orders seen in the dashboard.
 * @param {Object} params - { page, pageSize, orderStatus }
 */
export const getOrders = async (params = {}) => {
  try {
    // We explicitly map 'pending' to 'awaiting_shipment' to match ShipStation enums
    const response = await api.get('/shipments', { 
      params: {
        ...params,
        shipmentStatus: params.shipmentStatus || 'pending'
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Frontend Orders API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches fulfilled shipments (Labels already created).
 * @param {Object} params - { page, pageSize, shipmentStatus }
 */
export const getShipments = async (params = {}) => {
  try {
    const response = await api.get('/shipments', { params });
    return response.data;
  } catch (error) {
    console.error('Frontend Shipments API Error:', error.response?.data || error.message);
    throw error;
  }
};