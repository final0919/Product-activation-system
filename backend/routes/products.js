
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Import admin middleware
const Product = require('../models/Product');

// @route   GET api/products
// @desc    Get all products
// @access  Public (allow unauthenticated access for product listing)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Admin
router.post('/', [auth, admin], async (req, res) => {
  const { name, url, image, description, requiresActivation } = req.body;

  try {
    const newProduct = new Product({
      name,
      url,
      image: image || '', // 添加图片字段
      description,
      requiresActivation: requiresActivation !== undefined ? Boolean(requiresActivation) : true, // 确保布尔值正确处理
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, url, image, description, requiresActivation } = req.body;

  // Build product object
  const productFields = {};
  if (name !== undefined) productFields.name = name;
  if (url !== undefined) productFields.url = url;
  if (image !== undefined) productFields.image = image;
  if (description !== undefined) productFields.description = description;
  if (requiresActivation !== undefined) {
    // 确保布尔值正确处理
    productFields.requiresActivation = Boolean(requiresActivation);
  }

  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    await Product.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
