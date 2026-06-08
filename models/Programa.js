import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Programa = db.define('programas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique : true
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: false,
  tableName: 'programas',
      indexes: [
        {
            unique: true,
            fields: ['area_id', 'nombre'],
            name: 'uq_programas_area_nombre'
        }
    ]
});

export default Programa;
