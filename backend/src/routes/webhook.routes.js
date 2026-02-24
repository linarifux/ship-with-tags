import express from 'express';
import * as webhookController from '../controllers/webhook.controller.js';

const router = express.Router();

// Route: POST /api/webhooks/shipstation
router.post('/shipstation', webhookController.handleShipStationWebhook);

export default router;