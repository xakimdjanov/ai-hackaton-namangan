const express = require('express');
const router = express.Router();
const POI = require('../models/POI');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['super_admin']), async (req, res) => {
  const poi = await POI.create(req.body);
  res.status(201).json(poi);
});

router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const filter = all ? {} : { status: 'active' };
    const locations = await POI.findAll({ where: filter });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
