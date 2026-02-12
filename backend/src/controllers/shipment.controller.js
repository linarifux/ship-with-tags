import * as shipstationService from '../services/shipstation.service.js';

export const fetchShipments = async (req, res, next) => {
  try {
    const data = await shipstationService.getShipments(req.query);
    res.json(data);
  } catch (error) {
    res.status(502); // Bad Gateway - standard for upstream API issues
    next(error);
  }
};