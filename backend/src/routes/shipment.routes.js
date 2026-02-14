import express from 'express';
import { fetchShipments } from '../controllers/shipment.controller.js';

const router = express.Router();


/**
 * @route   GET /api/shipments
 * @desc    Get processed shipments (Labels created)
 */
router.get('/', fetchShipments);

export default router;