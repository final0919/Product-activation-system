
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ActivationCode = require('../models/ActivationCode');

// @route   POST api/users/activate-product
// @desc    Activate products with a code
// @access  Private
router.post('/activate-product', auth, async (req, res) => {
  const { code } = req.body;

  try {
    const activationCode = await ActivationCode.findOne({ code });

    if (!activationCode) {
      return res.status(404).json({ msg: 'Activation code not found' });
    }

    if (activationCode.isUsed) {
      return res.status(400).json({ msg: 'Activation code has already been used' });
    }

    const user = await User.findById(req.user.id);

    // Add products to user's activated products
    activationCode.products.forEach(productId => {
      if (!user.activatedProducts.includes(productId)) {
        user.activatedProducts.push(productId);
      }
    });

    await user.save();

    // Mark code as used
    activationCode.isUsed = true;
    await activationCode.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/:userId/products
// @desc    Update a user's activated products (Admin)
// @access  Private
router.put('/:userId/products', [auth, admin], async (req, res) => {
  // Here you would add a check to ensure the logged-in user is an admin
  // For now, we'll assume any authenticated user can do this for simplicity.

  const { activatedProducts } = req.body; // Expects an array of product IDs

  try {
    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.activatedProducts = activatedProducts;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users
// @desc    Get all users (Admin)
// @access  Private
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('activatedProducts', ['name']);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('activatedProducts');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user (Admin)
// @access  Private
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;