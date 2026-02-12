import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ShipStation V2 usually requires Basic Auth (Key:Secret).
 * However, based on your UI screenshot, if you are strictly using a single 
 * 'api-key' header, we configure the client accordingly.
 */
const client = axios.create({
  // Ensure your .env has SS_BASE_URL=https://ssapi.shipstation.com
  baseURL: process.env.SS_BASE_URL || 'https://ssapi.shipstation.com/v2',
  headers: {
    // Option A: Custom header (based on your screenshot's 'api-key' field)
    'api-key': process.env.SS_API_KEY,
    
    // Option B: If they still require the Authorization header format:
    // 'Authorization': `Basic ${Buffer.from(process.env.SHIPSTATION_API_KEY + ':').toString('base64')}`,
    
    'Content-Type': 'application/json',
  },
});

export const getShipments = async (params = {}) => {
  try {
    /**
     * ShipStation V2 endpoints usually start with /shipments.
     * Common params: page, pageSize, shipmentStatus, orderNumber
     */
    const response = await client.get('/shipments', { 
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 100,
        ...params 
      }
    });

    // ShipStation returns an object: { shipments: [], total: 0, page: 1, pages: 1 }
    return response.data;
  } catch (error) {
    // Log details for debugging, but throw a clean message for the controller
    console.error('SS_SERVICE_ERROR:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || 'ShipStation API Connection Failed';
    throw new Error(errorMessage);
  }
};