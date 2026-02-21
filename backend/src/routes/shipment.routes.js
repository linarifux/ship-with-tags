import express from 'express';
import { fetchShipments, updateOrderTags } from '../controllers/shipment.controller.js';

const router = express.Router();


/**
 * @route   GET /api/shipments
 * @desc    Get processed shipments (Labels created)
 */
router.get('/', fetchShipments);

router.post('/tags', updateOrderTags);


export default router;