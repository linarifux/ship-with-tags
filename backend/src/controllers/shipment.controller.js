import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Fetch shipments with filtering and pagination
 * @route   GET /api/shipments
 */
export const fetchShipments = async (req, res, next) => {
  try {
    // Extract parameters from the React frontend query string
    const { 
      page = 1, 
      pageSize = 20, 
      shipment_status // matches React state: 'pending', 'label_purchased', etc.
    } = req.query;

    
    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      shipment_status
    };

    

    const data = await shipstationService.getShipments(params);
    
    // Returns the full ShipStation response object to the frontend
    res.json(data);
    
  } catch (error) {
    // 502 Bad Gateway indicates the backend received an invalid response from ShipStation
    res.status(502);
    next(error);
  }
};