import {
    DataTypes
} from 'sequelize';
import db from '../config/conexion.js';

const AutorSecundario = db.define('autores_secundarios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articulo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'autores_secundarios'
});

export default AutorSecundario;