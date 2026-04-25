import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Evaluacion = db.define('evaluaciones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  articulo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  revisor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  veredicto: {
    type: DataTypes.ENUM('aprobado', 'corregir', 'rechazado')
  },
  observaciones_editor: {
    type: DataTypes.TEXT
  },
  observaciones_autor: {
    type: DataTypes.TEXT
  },
  fecha_evaluacion: {
    type: DataTypes.DATE
  }
}, {
  timestamps: false,
  tableName: 'evaluaciones'
});

export default Evaluacion;
