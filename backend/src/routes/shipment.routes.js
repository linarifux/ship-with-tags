import express from 'express';
import { fetchShipments, fetchOrders } from '../controllers/shipment.controller.js';

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get unfulfilled orders (Awaiting Shipment)
 */
router.get('/orders', fetchOrders);

/**
 * @route   GET /api/shipments
 * @desc    Get processed shipments (Labels created)
 */
router.get('/shipments', fetchShipments);

export default router;