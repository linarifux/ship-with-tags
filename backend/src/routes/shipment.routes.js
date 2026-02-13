import express from 'express';
import { fetchShipments } from '../controllers/shipment.controller.js';

const router = express.Router();

/**
 * @route   GET /api/shipments
 * @desc    Get a list of shipments from ShipStation with optional status/pagination filters
 * @access  Public
 */
router.get('/', fetchShipments);

export default router;