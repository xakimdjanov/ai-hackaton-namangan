const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Parking = sequelize.define('Parking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.JSON, // { uz: '', ru: '', en: '' }
    allowNull: false,
  },
  totalArea: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 41.0001,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 71.6726,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Parking;
