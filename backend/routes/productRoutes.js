const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Example route (add your real routes here)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...other CRUD routes...

module.exports = router;
