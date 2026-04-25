import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Revista = db.define('revistas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issn: {
    type: DataTypes.STRING,
    unique: true
  },
  periodicidad: {
    type: DataTypes.ENUM('semestral', 'anual')
  }
}, {
  timestamps: false,
  tableName: 'revistas'
});

export default Revista;
