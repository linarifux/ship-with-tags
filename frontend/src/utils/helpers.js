/**
 * Converts ISO dates into relative strings (just now, 5m ago, 2h ago, 3d ago)
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Scans the current list of shipments/orders to find all unique items.
 * This ensures items without SKUs are still discoverable and filterable.
 */
export const discoverProductsFromItems = (shipments) => {
  const productMap = new Map();

  shipments.forEach(shipment => {
    shipment.items?.forEach(item => {
      // Create a unique key. Prioritize SKU, but fallback to Name for SKU-less items.
      const key = item.sku || item.name;

      if (!productMap.has(key)) {
        productMap.set(key, { 
          // We use the key as the product_id to ensure the Filter component 
          // can uniquely identify items even if the DB id is missing.
          product_id: key, 
          sku: item.sku || null, 
          name: item.name, 
          // Pricing objects from shipments can be complex; 
          // wrapping it to match your ProductFilter expected structure.
          price: typeof item.unitPrice === 'object' 
            ? item.unitPrice 
            : { amount: item.unitPrice || 0, currency: 'USD' }
        });
      }
    });
  });

  // Return sorted alphabetically by name
  return Array.from(productMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
};