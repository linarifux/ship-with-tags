import * as shipstationService from '../services/shipstation.service.js';

export const fetchShipments = async (req, res, next) => {
  try {
    const { page = 1, page_size = 20, shipment_status, tag } = req.query;
    const params = { page: parseInt(page, 10), page_size: parseInt(page_size, 10), shipment_status, tag };
    const data = await shipstationService.getShipments(params);
    res.json(data);
  } catch (error) {
    res.status(502);
    next(error);
  }
};

export const updateOrderTags = async (req, res, next) => {
  try {
    const ids = req.body.shipmentIds || req.body.orderIds;
    const tagName = req.body.tagName || req.body.tag_name;
    const { action } = req.body;

    if (!ids || !Array.isArray(ids) || !tagName || !action) {
      return res.status(400).json({ message: "Invalid payload: Requires orderIds array, tagName, and action." });
    }

    const results = [];
    let hasError = false;
    let errorMessage = "Failed to update tags";

    for (const id of ids) {
      try {
        if (action === 'add') {
          await shipstationService.addTagToOrder(id, tagName);
        } else {
          await shipstationService.removeTagFromOrder(id, tagName);
        }
        results.push({ shipmentId: id, status: 'success' });
      } catch (err) {
        hasError = true;
        errorMessage = err.message; // Capture ShipStation's exact error
        results.push({ shipmentId: id, status: 'failed', error: err.message });
      }
    }

    // Force React to trigger the 'catch' block if it fails
    if (hasError) {
      return res.status(400).json({ message: errorMessage, results });
    }

    res.json({ message: "Tag update process complete", results });
  } catch (error) {
    res.status(500);
    next(error);
  }
};