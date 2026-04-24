const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = require('./config/db');

// Models
const User     = require('./models/User');
const Parking  = require('./models/Parking');
const Slot     = require('./models/Slot');
const POI      = require('./models/POI');
const Tracking = require('./models/Tracking');

// Routes
const authRoutes     = require('./routes/auth');
const parkingRoutes  = require('./routes/parking');
const slotsRoutes    = require('./routes/slots');
const locationRoutes = require('./routes/location');
const trackingRoutes = require('./routes/tracking');
const userRoutes     = require('./routes/users');
const aiRoutes        = require('./routes/ai');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Config
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Namangan Flowers Festival API',
            version: '1.0.0',
            description: 'Parkovka va Turizm navigatsiya tizimi API dokumentatsiyasi',
        },
        servers: [{ url: 'http://localhost:5000' }],
    },
    apis: ['./routes/*.js'], // Hamma routelardagi kommentlarni o'qiydi
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/api/auth',      authRoutes);

app.use('/api/parking',   parkingRoutes);
app.use('/api/slots',     slotsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/tracking',  trackingRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/ai',        aiRoutes);

// Database Sync & Super Admin Seed
const setupDatabase = async () => {
  try {
    // 'alter: true' ensures schema updates without data loss
    await sequelize.sync({ alter: true });

    const adminUser = process.env.ADMIN_USERNAME || 'super_admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'namangan2024';

    const existingAdmin = await User.findOne({ where: { role: 'super_admin' } });
    if (!existingAdmin) {
      await User.create({
        username: adminUser,
        password: bcrypt.hashSync(adminPass, 10),
        role: 'super_admin',
      });
      console.log(`✅ Default Super Admin created: ${adminUser}`);
    }
  } catch (err) {
    console.error('❌ Database Setup Error:', err.message);
  }
};

setupDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Production Server running on port ${PORT}`);
});
