import {
    DataTypes
} from 'sequelize';
import db from '../config/conexion.js';

const Articulo = db.define('articulos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    img: {
        type: DataTypes.STRING,
        allowNull: true
    },
    revista_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    numero_revista_id: {
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
    firma_originalidad: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    firma_etica: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    doi: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('enviado', 'en_revision', 'aprobado', 'rechazado', 'publicado', 'por_corregir', 'En_evaluacion', 'por_evaluar', 'Corregido', 'asignado'),
        defaultValue: 'enviado'
    },
    contenido_estructurado: {
        type: DataTypes.JSON
    },
    fecha_recepcion: {
        type: DataTypes.DATEONLY
    },
    fecha_publicacion: {
        type: DataTypes.DATEONLY
    },
    visitas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    descargas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: false,
    tableName: 'articulos'
});

export default Articulo;