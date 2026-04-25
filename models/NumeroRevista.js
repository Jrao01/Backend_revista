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
    volumen: {
        type: DataTypes.INTEGER
    },
    numero: {
        type: DataTypes.INTEGER
    },
    anio: {
        type: DataTypes.INTEGER
    },
    titulo_edicion: {
        type: DataTypes.STRING
        // note: 'Enero-Junio, Edición Especial'
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
    tableName: 'numeros_revista'
});

export default NumeroRevista;
