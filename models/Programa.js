import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Programa = db.define('programas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'programas'
});

export default Programa;
