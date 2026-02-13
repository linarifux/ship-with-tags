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
 * Fetches unfulfilled orders (e.g., Awaiting Shipment)
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await client.get('/orders', { 
      params: {
        page: params.page || 1,
        page_size: params.pageSize || 100,
        // 'awaiting_shipment' captures your 1,023 unfulfilled orders
        order_status: params.orderStatus || 'awaiting_shipment',
        sort_by: 'order_date',
        sort_dir: 'DESC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('SS_ORDERS_ERROR:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'ShipStation Orders API Failed');
  }
};

/**
 * Fetches fulfilled shipments (Labels created)
 */
export const getShipments = async (params = {}) => {
  try {
    const response = await client.get('/shipments', { 
      params: {
        page: params.page || 1,
        page_size: params.pageSize || 100,
        shipment_status: params.shipmentStatus || undefined,
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