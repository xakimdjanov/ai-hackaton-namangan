const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tracking = sequelize.define('Tracking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null for anonymous users
  },
  username: {
    type: DataTypes.STRING,
    defaultValue: 'Anonymous',
  },
  destinationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destinationType: {
    type: DataTypes.ENUM('parking', 'poi'),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Tracking;
