import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Articulo = db.define('articulos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  revista_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numero_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  programa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  linea_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  autor_principal_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  titulo_es: {
    type: DataTypes.STRING,
    allowNull: false
  },
  titulo_en: {
    type: DataTypes.STRING
  },
  resumen_es: {
    type: DataTypes.TEXT
  },
  resumen_en: {
    type: DataTypes.TEXT
  },
  palabras_clave: {
    type: DataTypes.STRING
  },
  doi: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'enviado'
    // note: 'enviado, en_revision, aprobado, rechazado, publicado'
  },
  fecha_recepcion: {
    type: DataTypes.DATEONLY
  },
  fecha_publicacion: {
    type: DataTypes.DATEONLY
  }
}, {
  timestamps: false,
  tableName: 'articulos'
});

export default Articulo;
