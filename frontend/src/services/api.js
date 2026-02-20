import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetches shipments/orders based on status and pagination
 */
export const getShipments = (params) => 
  api.get('/shipments', { params }).then(res => res.data);

/**
 * NEW: Fetches all available ShipStation tags
 * Useful for populating tag-based filters in the dashboard
 */
export const getTags = () => 
  api.get('/tags').then(res => res.data);

/**
 * Optional: Bulk purchase logic (uncomment if your backend route is ready)
 */
// export const bulkPurchaseLabels = (orderIds) => 
//   api.post('/shipments/bulk-label', { orderIds }).then(res => res.data);

export default api;