const express = require('express');
const router = express.Router();
const Parking  = require('../models/Parking');
const Slot = require('../models/Slot');

/**
 * @swagger
 * /api/parking:
 *   get:
 *     summary: Barcha parkovkalarni olish
 *     tags: [Parking]
 *     responses:
 *       200:
 *         description: Parkovkalar ro'yxati
 */
router.get('/', async (req, res) => {
  try {
    const list = await Parking.findAll();
    const updatedList = await Promise.all(list.map(async (p) => {
      const freeCount = await Slot.count({ where: { parkingId: p.id, status: 'free' } });
      if (p.freeSlots !== freeCount) await p.update({ freeSlots: freeCount });
      return { ...p.toJSON(), freeSlots: freeCount };
    }));
    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/parking/{id}:
 *   get:
 *     summary: Bitta parkovkani olish
 *     tags: [Parking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res) => {
  try {
    const p = await Parking.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Parkovka topilmadi' });
    const freeCount = await Slot.count({ where: { parkingId: p.id, status: 'free' } });
    res.json({ ...p.toJSON(), freeSlots: freeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/parking:
 *   post:
 *     summary: Yangi parkovka yaratish
 *     tags: [Parking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               totalArea:
 *                 type: number
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               adminId:
 *                 type: integer
 *     responses:
 *       210:
 *         description: Yaratilgan parkovka
 */
router.post('/', async (req, res) => {
  try {
    const { name, totalArea, latitude, longitude, adminId } = req.body;
    
    // Agar name string bo'lib kelsa (frontend hali tayyor bo'lmasa), 
    // uni JSON formatiga o'tkazish kerak bo'ladi (yoki AI orqali tarjima qilish).
    // Lekin model JSON kutyapti. 
    
    const newParking = await Parking.create({
      name: typeof name === 'string' ? { uz: name, ru: name, en: name } : name,
      totalArea,
      latitude,
      longitude,
      adminId
    });
    
    res.status(201).json(newParking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
