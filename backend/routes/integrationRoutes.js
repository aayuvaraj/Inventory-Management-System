const express = require('express');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Look up packaged food product details through the Open Food Facts API.
router.get('/barcode/:barcode', protect, async (req, res) => {
  try {
    const barcode = String(req.params.barcode || '').trim();
    if (!/^\d{8,14}$/.test(barcode)) {
      return res.status(400).json({ message: 'Enter a valid product barcode containing 8 to 14 digits.' });
    }

    const fields = 'code,product_name,brands,categories,quantity,image_url';
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`,
      { headers: { 'User-Agent': 'InventoryManagementSystem/1.0 (product lookup)' }, signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return res.status(502).json({ message: 'The product information service is temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    if (data.status !== 1 || !data.product) {
      return res.status(404).json({ message: 'No product was found for this barcode. You can enter the details manually.' });
    }

    const product = data.product;
    const firstCategory = String(product.categories || '').split(',')[0].trim();
    res.json({
      barcode: product.code || barcode,
      name: product.product_name || '',
      brand: product.brands || '',
      category: firstCategory,
      packageQuantity: product.quantity || '',
      imageUrl: product.image_url || ''
    });
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
    res.status(timedOut ? 504 : 502).json({
      message: timedOut ? 'Product lookup timed out. Please try again.' : 'Unable to retrieve product details right now.'
    });
  }
});

module.exports = router;
