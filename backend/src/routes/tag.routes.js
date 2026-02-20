import express from 'express';
import * as tagController from '../controllers/tag.controller.js';

const router = express.Router();

// Define the route
router.get('/', tagController.getAllTags);

export default router;