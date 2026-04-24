const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Parking = require('../models/Parking');

// Get slots for a parking
router.get('/', async (req, res) => {
  try {
    const { parkingId, status } = req.query;
    const filter = {};
    if (parkingId) filter.parkingId = parkingId;
    if (status) filter.status = status;

    const slots = await Slot.findAll({ where: filter });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Summary for specific parking
router.get('/summary', async (req, res) => {
    try {
      const { parkingId } = req.query;
      if (!parkingId) return res.status(400).json({ message: 'parkingId required' });
  
      const total    = await Slot.count({ where: { parkingId } });
      const free     = await Slot.count({ where: { parkingId, status: 'free' } });
      const occupied = await Slot.count({ where: { parkingId, status: 'occupied' } });
  
      res.json({ total, free, occupied });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// POST Generate slots for parking
router.post('/generate', async (req, res) => {
    try {
      const { parkingId, capacity, colsPerRow, type } = req.body;
      if (!parkingId || !capacity) return res.status(400).json({ message: 'parkingId and capacity required' });
  
      const count = parseInt(capacity);
      const cols = parseInt(colsPerRow) || 5;

      const newSlots = [];
      for (let i = 0; i < count; i++) {
        const row = String.fromCharCode(65 + Math.floor(i / cols)); // A, B, C...
        const col = (i % cols) + 1; // 1, 2, 3...
        
        newSlots.push({
          parkingId,
          slotNumber: `${row}${col}`,
          status: 'free',
          type: type || 'standard'
        });
      }
  
      await Slot.bulkCreate(newSlots);
      
      const totalFree = await Slot.count({ where: { parkingId, status: 'free' } });
      await Parking.update({ freeSlots: totalFree }, { where: { id: parkingId } });
  
      res.json({ message: `${count} ta slot yaratildi`, created: count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});


// Update slot status (Legacy/Frontend Match)
router.put('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const slot = await Slot.findByPk(req.params.id);
      if (!slot) return res.status(404).json({ message: 'Slot not found' });
  
      slot.status = status;
      await slot.save();
  
      const freeCount = await Slot.count({ 
        where: { parkingId: slot.parkingId, status: 'free' } 
      });
      await Parking.update({ freeSlots: freeCount }, { where: { id: slot.parkingId } });
  
      res.json(slot);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;

