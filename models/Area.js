import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Area = db.define('areas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color_institucional: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false,
  tableName: 'areas'
});

export default Area;
