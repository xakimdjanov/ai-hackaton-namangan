const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const POI = sequelize.define('POI', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.JSON, // { uz: '', ru: '', en: '' }
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.JSON, // { uz: '', ru: '', en: '' }
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'place',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
});

module.exports = POI;
