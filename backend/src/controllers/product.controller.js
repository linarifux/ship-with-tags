import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Fetch products with filtering and pagination
 * @route   GET /api/products
 */
export const fetchProducts = async (req, res, next) => {
  try {
    const { page, page_size, active, sku, name } = req.query;

    const params = {
      page: parseInt(page) || 1,
      page_size: parseInt(page_size) || 100,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      sku,
      name
    };

    const data = await shipstationService.getProducts(params);
    res.json(data);
  } catch (error) {
    res.status(502); // Bad Gateway for upstream API issues
    next(error);
  }
};