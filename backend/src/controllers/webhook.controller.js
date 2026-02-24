import * as shipstationService from '../services/shipstation.service.js';

/**
 * @desc    Listens for ShipStation Webhooks (e.g., ORDER_NOTIFY)
 * @route   POST /api/webhooks/shipstation
 * @access  Public
 */
export const handleShipStationWebhook = async (req, res) => {
  const { resource_url, resource_type } = req.body;

  console.log(resource_type, resource_url);
  
  // We only want to process new orders
  if (resource_type !== 'ORDER_NOTIFY') {
    // Acknowledge and ignore non-order events
    return res.status(200).send('Event ignored');
  }

  try {
    // 1. Fetch the newly imported orders from the provided ShipStation URL
    const data = await shipstationService.fetchWebhookData(resource_url);
    const orders = data.orders || [];

    // Track tags we've already tried to create in this run to avoid API spam
    const createdTags = new Set();

    // 2. Loop through orders and items to apply tags
    for (const order of orders) {
      const items = order.items || [];
      
      // We will use order.orderId (ShipStation's internal ID for the order)
      const targetId = order.orderId; 

      for (const item of items) {
        if (!item.name) continue;

        // Sanitize the item name: remove special chars to prevent URL breaking (keep letters, numbers, spaces)
        const safeName = item.name.replace(/[^\w\s]/gi, '').trim();
        
        // Extract the first 3 words
        const tagName = safeName.split(/\s+/).slice(0, 3).join(' ');

        if (!tagName) continue;

        // Step A: Ensure the tag exists in ShipStation (only try once per unique tag)
        if (!createdTags.has(tagName)) {
          try {
            await shipstationService.createTag({ name: tagName, color: '#3b82f6' });
            createdTags.add(tagName);
          } catch (err) {
            // If the tag already exists, ShipStation throws an error. We safely ignore it.
            createdTags.add(tagName);
          }
        }

        // Step B: Apply the tag to the order
        try {
          await shipstationService.addTagToOrder(targetId, tagName);
          console.log(`✅ Automatically tagged Order ${order.orderNumber} with "${tagName}"`);
        } catch (err) {
          console.error(`❌ Failed to tag Order ${order.orderNumber}:`, err.message);
        }
      }
    }

    // 3. Send response AFTER processing is completely finished!
    // This is crucial for Netlify/Serverless environments to prevent early termination.
    res.status(200).send('Webhook Processed Successfully');

  } catch (error) {
    console.error('Webhook Processing Error:', error.message);
    // Still return 200 so ShipStation doesn't permanently disable the webhook thinking your server is down
    res.status(200).send('Webhook Processed with Errors');
  }
};