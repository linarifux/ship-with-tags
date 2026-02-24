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
        tag: params.tag || undefined,
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
    return response.data; 
  } catch (error) {
    console.error('SS_TAGS_ERROR:', error.response?.data || error.message);
    throw new Error('Failed to fetch tags from ShipStation');
  }
};

// ************************************************************
// Tag Management Functions
// ************************************************************

/**
 * Creates a new tag in the ShipStation account.
 * POST /v2/tags/{{tag_name}}
 * @param {Object} tagData - { name, color }
 */
export const createTag = async (tagData) => {
  try {
    const encodedTagName = encodeURIComponent(tagData.name);
    const response = await client.post(`/tags/${encodedTagName}`, tagData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.ExceptionMessage || error.response?.data?.message || error.message;
    throw new Error(msg);
  }
};

export const addTagToOrder = async (shipment_id, tag_name) => {
  try {
    const encodedTag = encodeURIComponent(tag_name);
    // Added {} as the second parameter to enforce POST rules
    const response = await client.post(`/shipments/${shipment_id}/tags/${encodedTag}`, {});
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.ExceptionMessage || error.response?.data?.message || error.message;
    throw new Error(msg);
  }
};

export const removeTagFromOrder = async (shipment_id, tag_name) => {
  try {
    const encodedTag = encodeURIComponent(tag_name);
    // Added data: {} for DELETE rules
    const response = await client.delete(`/shipments/${shipment_id}/tags/${encodedTag}`, { data: {} });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.ExceptionMessage || error.response?.data?.message || error.message;
    throw new Error(msg);
  }
};


/**
 * Fetches the raw data from a ShipStation Webhook resource URL
 * @param {string} resourceUrl - The full URL provided in the webhook payload
 */
export const fetchWebhookData = async (resourceUrl) => {
  try {
    // Axios handles full URLs automatically, even if a baseURL is set
    const response = await client.get(resourceUrl);
    return response.data;
  } catch (error) {
    console.error('SS_WEBHOOK_FETCH_ERROR:', error.message);
    throw new Error('Failed to fetch data from ShipStation Webhook URL');
  }
};

