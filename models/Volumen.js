import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const Volumen = db.define('volumenes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    revista_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    numero_volumen: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'volumenes',
    indexes: [
        {
            unique: true,
            fields: ['revista_id', 'numero_volumen'],
            name: 'uq_volumenes_revista_numero_volumen'
        }
    ]
});

export default Volumen;
