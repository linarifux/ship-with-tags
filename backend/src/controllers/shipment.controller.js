import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Fetch PROCESSED shipments (Labels purchased)
 * @route   GET /api/shipments
 * @access  Public
 */
export const fetchShipments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      page_size = 20, 
      shipment_status,
      tag
    } = req.query;

    const params = {
      page: parseInt(page, 10),
      page_size: parseInt(page_size, 10),
      shipment_status,
      tag
    };

    const data = await shipstationService.getShipments(params);
    res.json(data);
  } catch (error) {
    res.status(502);
    next(error);
  }
};

/**
 * @desc    Updates tags for a batch of shipments.
 * @route   POST /api/shipments/tags
 * @access  Public
 * @body    { shipmentIds: [123, 456], tagName: "VIP", action: 'add' | 'remove' }
 */
export const updateOrderTags = async (req, res, next) => {
  try {
    // Accommodate both orderIds/shipmentIds to match frontend seamlessly
    const ids = req.body.shipmentIds || req.body.orderIds;
    // Expect tagName based on our new ShipStation service rules
    const tagName = req.body.tagName || req.body.tag_name;
    const { action } = req.body;

    if (!ids || !Array.isArray(ids) || !tagName || !action) {
      return res.status(400).json({ 
        message: "Invalid payload: Requires shipmentIds array, tagName, and action ('add' or 'remove')." 
      });
    }

    const results = [];
    
    // Process sequentially to avoid hitting ShipStation rate limits.
    // If you have high volume, you can chunk this using Promise.all in batches.
    for (const id of ids) {
      try {
        if (action === 'add') {
          await shipstationService.addTagToOrder(id, tagName);
        } else if (action === 'remove') {
          await shipstationService.removeTagFromOrder(id, tagName);
        }
        results.push({ shipmentId: id, status: 'success' });
      } catch (err) {
        results.push({ shipmentId: id, status: 'failed', error: err.message });
      }
    }

    res.json({ message: "Tag update process complete", results });
  } catch (error) {
    res.status(500);
    next(error);
  }
};