const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  parkingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  slotNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('free', 'occupied', 'booked'),
    defaultValue: 'free',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'standard',
  },
  latitude: {

    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

module.exports = Slot;
