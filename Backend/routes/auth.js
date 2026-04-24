const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Tizimga kirish
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login muvaffaqiyatli
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET);
  res.json({ token, role: user.role, userId: user.id });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Ro'yxatdan o'tish (Turistlar uchun)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: 'user' });
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET);
    res.status(201).json({ token, role: user.role, userId: user.id });
  } catch (err) {
    res.status(400).json({ error: 'Username allaqachon mavjud' });
  }
});

module.exports = router;
