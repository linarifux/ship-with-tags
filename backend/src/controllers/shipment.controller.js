import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Fetch UNFULFILLED orders (Awaiting Shipment)
 * @route   GET /api/orders
 */
export const fetchOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 100, 
      orderStatus = 'awaiting_shipment' // Maps to your 1,023 orders
    } = req.query;

    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      orderStatus
    };

    const data = await shipstationService.getOrders(params);
    res.json(data);
  } catch (error) {
    res.status(502);
    next(error);
  }
};

/**
 * @desc    Fetch PROCESSED shipments (Labels purchased)
 * @route   GET /api/shipments
 */
export const fetchShipments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      shipment_status 
    } = req.query;

    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      shipmentStatus: shipment_status // Maps to "label_purchased" etc.
    };

    const data = await shipstationService.getShipments(params);
    res.json(data);
  } catch (error) {
    res.status(502);
    next(error);
  }
};