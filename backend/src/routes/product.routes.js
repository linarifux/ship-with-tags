import express from 'express';
import { fetchProducts } from '../controllers/product.controller.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get a list of products from ShipStation
 */
router.get('/', fetchProducts);

export default router;