const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ username, password: hashedPassword, role });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authenticate, authorize(['super_admin']), async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username', 'role'] });
  res.json(users);
});

module.exports = router;
