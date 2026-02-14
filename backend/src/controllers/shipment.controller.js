import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Fetch PROCESSED shipments (Labels purchased)
 * @route   GET /api/shipments
 */
export const fetchShipments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      page_size = 20, 
      shipment_status 
    } = req.query;

    const params = {
      page: parseInt(page),
      page_size: parseInt(page_size),
      shipment_status 
    };

    const data = await shipstationService.getShipments(params);
    res.json(data);
  } catch (error) {
    res.status(502);
    next(error);
  }
};