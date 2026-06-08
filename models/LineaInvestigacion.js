import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const LineaInvestigacion = db.define('lineas_investigacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  programa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: false,
  tableName: 'lineas_investigacion',
      indexes: [
        {
            unique: true,
            fields: ['programa_id', 'nombre'],
            name: 'uq_lineas_investigacion_programa_nombre'
        }
    ]
});

export default LineaInvestigacion;
