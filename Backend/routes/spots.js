const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/ParkingSpot');
const Parking = require('../models/Parking');
const { authenticate, authorize } = require('../middleware/auth');

// Admin bitta joyning markazida turib yangi joy qo'shadi
router.post('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { parkingId, latitude, longitude } = req.body;

    // Avtomatik spot raqami
    const count = await ParkingSpot.count({ where: { parkingId } });
    const spot = await ParkingSpot.create({
      parkingId,
      spotNumber: count + 1,
      latitude,
      longitude,
      status: 'bosh',
    });

    // Parkovkaning bo'sh joy sonini ham yangilash
    await Parking.increment('totalSpots', { where: { id: parkingId } });

    res.status(201).json(spot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Berilgan parkovkaning barcha joylarini olish
router.get('/', async (req, res) => {
  const { parkingId } = req.query;
  const spots = await ParkingSpot.findAll({
    where: parkingId ? { parkingId } : {},
    order: [['spotNumber', 'ASC']],
  });
  res.json(spots);
});

// Jo statusini almashtirish (bosh <-> band)
router.put('/:id/status', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { status } = req.body; // 'bosh' or 'band'
    const spot = await ParkingSpot.findByPk(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Joy topilmadi' });

    spot.status = status;
    await spot.save();

    // Parkovkaning band joylar sonini yangilash
    const parking = await Parking.findByPk(spot.parkingId);
    if (parking) {
      const occupiedCount = await ParkingSpot.count({ where: { parkingId: spot.parkingId, status: 'band' } });
      parking.occupiedSpaces = occupiedCount;
      await parking.save();
    }

    res.json(spot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a spot
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  const spot = await ParkingSpot.findByPk(req.params.id);
  if (spot) {
    const { parkingId } = spot;
    await spot.destroy();
    await Parking.decrement('totalSpots', { where: { id: parkingId } });
    res.json({ message: "O'chirildi" });
  } else {
    res.status(404).json({ message: 'Topilmadi' });
  }
});

module.exports = router;
