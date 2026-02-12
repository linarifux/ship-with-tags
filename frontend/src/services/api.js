import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getShipments = async () => {
  try {
    const response = await api.get('/shipments');
    // ShipStation returns { shipments: [...], total: X, page: X }
    return response.data.shipments;
  } catch (error) {
    console.error('Frontend API Error:', error.response?.data || error.message);
    throw error; // Let the component handle the UI state for errors
  }
};