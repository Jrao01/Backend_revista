import {
    DataTypes
} from 'sequelize';
import db from '../config/conexion.js';

const Usuario = db.define('usuarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    segundo_nombre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    segundo_apellido: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cedula: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    oncti: {
        type: DataTypes.STRING,
        allowNull: true
    },
    afiliacion_institucional: {
        type: DataTypes.STRING,
        allowNull: false
    }, // ejemplo: Programa de Medicina, Área de Ciencias de la Salud, Universidad Nacional Experimental de los Llanos Centrales Rómulo Gallegos (UNERG),
    // San Juan de los Morros, Venezuela
    rol: {
        type: DataTypes.ENUM('admin', 'editor', 'revisor', 'investigador'),
        allowNull: false
    },
    cv: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'usuarios'
});

export default Usuario;