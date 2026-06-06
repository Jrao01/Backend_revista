import { DataTypes } from 'sequelize';
import db from '../config/conexion.js';

const NumeroRevista = db.define('numeros_revista', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    revista_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    volumen_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    anio: {
        type: DataTypes.INTEGER
    },
    titulo_edicion: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('futuro', 'publicado'),
        defaultValue: 'futuro'
    },
    fecha_publicacion: {
        type: DataTypes.DATEONLY
    }
}, {
    timestamps: false,
    tableName: 'numeros_revista',
    indexes: [
        {
            unique: true,
            fields: ['volumen_id', 'numero'],
            name: 'uq_numeros_volumen_numero'
        }
    ]
});

export default NumeroRevista;
