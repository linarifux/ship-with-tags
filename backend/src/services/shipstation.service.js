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


/**
 * Fetches all products from ShipStation
 * Supports filtering by active status, sku, and name
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await client.get('/products', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 100,
        active: params.active || undefined,
        sku: params.sku || undefined,
        name: params.name || undefined,
      }
    });
    // ShipStation returns: { "products": [...], "total": X, "page": X, "pages": X }
    return response.data;
  } catch (error) {
    console.error('SS_PRODUCT_ERROR:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'ShipStation Products API Failed');
  }
};


/**
 * Fetches all tags defined in the ShipStation account.
 * Tags are used for organizing and filtering orders.
 */
export const getTags = async () => {
  try {
    const response = await client.get('/tags');
    // ShipStation returns an array of tag objects
    return response.data; 
  } catch (error) {
    console.error('SS_TAGS_ERROR:', error.response?.data || error.message);
    throw new Error('Failed to fetch tags from ShipStation');
  }
};