import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the product catalog from ShipStation.
 * Used for populating product filters in the UI.
 * @param {Object} params - { page, page_size, active, sku, name }
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    console.log(response);
    
    return response.data;
  } catch (error) {
    console.error('Frontend Products API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches shipments with optional filters and pagination.
 * shipment_status options: "pending", "processing", "label_purchased", "cancelled"
 * @param {Object} params - { page, page_size, shipment_status, sort_by, sort_dir }
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