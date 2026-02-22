import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetches shipments/orders based on status and pagination
 * GET /api/shipments
 */
export const getShipments = (params) => 
  api.get('/shipments', { params }).then(res => res.data);

/**
 * Fetches all available ShipStation tags
 * GET /api/tags
 */
export const getTags = () => 
  api.get('/tags').then(res => res.data);

/**
 * Creates a new tag globally in ShipStation
 * POST /api/tags
 * @param {Object} tagData - { name: string, color: string }
 */
export const createTag = (tagData) => 
  api.post('/tags', tagData).then(res => res.data);

/**
 * Assigns or removes tags for a specific batch of shipments.
 * The backend Node.js server receives this bulk payload and maps it to the 
 * individual /v2/shipments/{id}/tags/{name} ShipStation endpoints.
 * * POST /api/shipments/tags
 * @param {Object} payload - { shipmentIds: [123, 456], tagName: string, action: 'add' | 'remove' }
 */
export const updateOrderTags = (payload) => 
  api.post('/shipments/tags', payload).then(res => res.data);

/**
 * Optional: Bulk purchase logic (uncomment if your backend route is ready)
 */
// export const bulkPurchaseLabels = (orderIds) => 
//   api.post('/shipments/bulk-label', { orderIds }).then(res => res.data);

export default api;