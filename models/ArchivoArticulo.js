import {
    DataTypes
} from 'sequelize';
import db from '../config/conexion.js';

const ArchivoArticulo = db.define('archivos_articulos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    articulo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo_archivo: {
        type: DataTypes.ENUM('manuscrito_original', // proporcionado por el autor en el primer registro del articulo
            'pagina_titulo', // proporcionado por el autor en el primer registro del articulo
            'carta_originalidad', // proporcionado por el autor en el primer registro del articulo
            'ficha_autores', // proporcionado por el autor en el primer registro del articulo
            'certificado_etica', // archivo proporcionado por el autor en el primer registro del articulo
            'material_suplementario', // proporcionado por el autor en el primer registro del articulo
            'manuscrito_anonimizado', // proporcionado por el editor para que el jurado pueda evaluar de forma ciega
            'informe_evaluacion', // archivo proporcionado por el jurado
            'galerada_pdf', // archivo final del articulo en formato pdf
            'galerada_xml_jats', // archivo final del articulo en formato xml jats
            'galerada_html', // archivo final del articulo en formato html
            'galerada_epub', // archivo final del articulo en formato epub
            'informe_plagio', // archivo proporcionado por el editor o el jurado
            'manuscrito_corregido'), // archivo proporcionado por el autor luego de corregir lo indicado por el jurado
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    es_anonimo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        // note: 'Para el proceso de arbitraje doble ciego'
    }
}, {
    timestamps: false,
    tableName: 'archivos_articulos'
});

export default ArchivoArticulo;