import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const client = axios.create({
  baseURL: process.env.SS_BASE_URL || 'https://ssapi.shipstation.com/v2',
  headers: {
    'api-key': process.env.SS_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches fulfilled shipments (Labels created)
 */
export const getShipments = async (params = {}) => {
  try {
    const response = await client.get('/shipments', { 
      params: {
        page: params.page || 1,
        page_size: params.page_size || 100,
        shipment_status: params.shipment_status || undefined,
        sort_by: 'created_at',
        sort_dir: 'DESC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('SS_SHIPMENT_ERROR:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'ShipStation Shipments API Failed');
  }
};