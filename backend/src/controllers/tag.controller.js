import * as shipstationService from '../services/shipstation.service.js';

/**
 * GET /api/tags
 * Returns a list of all tags available in the ShipStation account.
 */
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await shipstationService.getTags();
    res.json(tags);
  } catch (error) {
    // Passes the error to your global error handler
    res.status(500);
    next(error);
  }
};
