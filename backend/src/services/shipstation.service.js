import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_STRING = Buffer.from(
  `${process.env.SHIPSTATION_API_KEY}:${process.env.SHIPSTATION_API_SECRET}`
).toString('base64');

const client = axios.create({
  baseURL: process.env.SS_BASE_URL,
  headers: {
    Authorization: `Basic ${AUTH_STRING}`,
    'Content-Type': 'application/json',
  },
});

export const getShipments = async (params = {}) => {
  try {
    const response = await client.get('/shipments', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'ShipStation API Error');
  }
};