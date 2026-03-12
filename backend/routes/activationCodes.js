
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Import admin middleware
const ActivationCode = require('../models/ActivationCode');

// @route   GET api/activation-codes
// @desc    Get all activation codes
// @access  Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const codes = await ActivationCode.find().populate('products', ['name']);
    res.json(codes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/activation-codes
// @desc    Create an activation code
// @access  Admin
router.post('/', [auth, admin], async (req, res) => {
  const { code, products } = req.body;

  try {
    const newCode = new ActivationCode({
      code,
      products,
    });

    const activationCode = await newCode.save();
    res.json(activationCode);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/activation-codes/:id
// @desc    Update an activation code
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { code, products, isUsed } = req.body;

  const codeFields = {};
  if (code) codeFields.code = code;
  if (products) codeFields.products = products;
  if (isUsed !== undefined) codeFields.isUsed = isUsed;

  try {
    let activationCode = await ActivationCode.findById(req.params.id);

    if (!activationCode) return res.status(404).json({ msg: 'Activation code not found' });

    activationCode = await ActivationCode.findByIdAndUpdate(
      req.params.id,
      { $set: codeFields },
      { new: true }
    );

    res.json(activationCode);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/activation-codes/:id
// @desc    Delete an activation code
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    let activationCode = await ActivationCode.findById(req.params.id);

    if (!activationCode) return res.status(404).json({ msg: 'Activation code not found' });

    await ActivationCode.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Activation code removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
