import {
    DataTypes
} from 'sequelize';
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
    },
    descripcion: {
        type: DataTypes.STRING
    },
    portada: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lineas_permitidas: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'revistas'
});

export default Revista;