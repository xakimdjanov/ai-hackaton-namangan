const express = require('express');
const router = express.Router();
const Tracking = require('../models/Tracking');
const { optionalAuth, authenticate, authorize } = require('../middleware/auth');

// Track a new destination selection
router.post('/', optionalAuth, async (req, res) => {
  const { destinationName, destinationType } = req.body;
  try {
    const tracking = await Tracking.create({
      userId: req.user?.id,
      username: req.user?.username || 'Anonymous',
      destinationName,
      destinationType
    });
    res.status(201).json(tracking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// View tracking statistics (Super Admin only)
router.get('/', authenticate, authorize(['super_admin']), async (req, res) => {
  const status = await Tracking.findAll({ order: [['timestamp', 'DESC']] });
  res.json(status);
});

module.exports = router;