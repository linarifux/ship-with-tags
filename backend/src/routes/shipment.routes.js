import express from 'express';
import { fetchShipments } from '../controllers/shipment.controller.js';

const router = express.Router();

/**
 * @route   GET /api/shipments
 * @desc    Get a list of shipments from ShipStation
 * @access  Public (Add auth middleware here later)
 */
router.get('/', fetchShipments);

// Example of future expansion:
// router.get('/:id', getShipmentById);

export default router;