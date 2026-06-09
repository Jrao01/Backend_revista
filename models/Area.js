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
    allowNull: false,
    unique: true
  },
  color_institucional: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: false,
  tableName: 'areas'
});

export default Area;
