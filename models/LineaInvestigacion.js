import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const LineaInvestigacion = db.define('lineas_investigacion', {
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
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
    // note: 'Matriz, Asociada'
  }
}, {
  timestamps: false,
  tableName: 'lineas_investigacion'
});

export default LineaInvestigacion;
