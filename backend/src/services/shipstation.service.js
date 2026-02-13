import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ShipStation V2 Client
 * Configured with the specific 'api-key' header found in the documentation.
 */
const client = axios.create({
  // Base URL should include the versioning if not part of the individual request
  baseURL: process.env.SS_BASE_URL || 'https://ssapi.shipstation.com/v2',
  headers: {
    // Custom header specifically for your API key implementation
    'api-key': process.env.SS_API_KEY,
    'Content-Type': 'application/json',
  },
});

export const getShipments = async (params = {}) => {
  try {
    /**
     * Official parameters for /v2/shipments:
     * shipment_status: pending, processing, label_purchased, cancelled
     * page: integer
     * page_size: integer
     */

    
    const response = await client.get('/shipments', { 
      params: {
        page: params.page || 1,
        page_size: params.pageSize || 100,
        shipment_status: params.shipmentStatus || undefined,
        batch_id: params.batchId || undefined
      }
    });

    // ShipStation returns: { "shipments": [...], "total": X, "page": X, "pages": X }
    return response.data;
  } catch (error) {
    // Log raw data for backend debugging
    console.error('SS_SERVICE_ERROR:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || 'ShipStation API Connection Failed';
    throw new Error(errorMessage);
  }
};