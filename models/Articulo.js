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
        allowNull: true,
        required: true
    },
    revista_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    numero_revista_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    linea_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        required: true
    },
    autor_principal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        required: true
    },
    titulo_es: {
        type: DataTypes.STRING,
        allowNull: false,
        required: true
    },
    titulo_en: {
        type: DataTypes.STRING,
        required: true
    },
    resumen_es: {
        type: DataTypes.TEXT,
        required: true
    },
    resumen_en: {
        type: DataTypes.TEXT,
        required: true
    },
    palabras_clave: {
        type: DataTypes.STRING,
        required: true
    },
    firma_originalidad: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        required: true,
    },
    firma_etica: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        required: true,
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
    fecha_recepcion: {
        type: DataTypes.DATEONLY
    },
    fecha_publicacion: {
        type: DataTypes.DATEONLY
    },
    pages: {
        type: DataTypes.STRING,
        allowNull: true
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    downloads: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    visitas: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.views;
        },
        set(value) {
            this.views = value;
        }
    },
    descargas: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.downloads;
        },
        set(value) {
            this.downloads = value;
        }
    }
}, {
    timestamps: false,
    tableName: 'articulos'
});

export default Articulo;
