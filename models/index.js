import Usuario from './Usuario.js';
import Area from './Area.js';
import Programa from './Programa.js';
import LineaInvestigacion from './LineaInvestigacion.js';
import Revista from './Revista.js';
import Articulo from './Articulo.js';
import AutorSecundario from './AutorSecundario.js';
import ArchivoArticulo from './ArchivoArticulo.js';
import Evaluacion from './Evaluacion.js';
import NumeroRevista from './NumeroRevista.js';

// areas.id < programas.area_id
Area.hasMany(Programa, {
    foreignKey: 'area_id'
});
Programa.belongsTo(Area, {
    foreignKey: 'area_id'
});

// areas.id < lineas_investigacion.area_id
Area.hasMany(LineaInvestigacion, {
    foreignKey: 'area_id'
});
LineaInvestigacion.belongsTo(Area, {
    foreignKey: 'area_id'
});

// programas.id < articulos.programa_id
Programa.hasMany(Articulo, {
    foreignKey: 'programa_id'
});
Articulo.belongsTo(Programa, {
    foreignKey: 'programa_id'
});

// lineas_investigacion.id < articulos.linea_id
LineaInvestigacion.hasMany(Articulo, {
    foreignKey: 'linea_id'
});
Articulo.belongsTo(LineaInvestigacion, {
    foreignKey: 'linea_id'
});

// usuarios.id < articulos.autor_principal_id
Usuario.hasMany(Articulo, {
    foreignKey: 'autor_principal_id',
    as: 'articulos_principales'
});
Articulo.belongsTo(Usuario, {
    foreignKey: 'autor_principal_id',
    as: 'autor_principal'
});

// revistas.id < articulos.revista_id
Revista.hasMany(Articulo, {
    foreignKey: 'revista_id'
});
Articulo.belongsTo(Revista, {
    foreignKey: 'revista_id'
});

// revistas.id < numeros_revista.revista_id
Revista.hasMany(NumeroRevista, {
    foreignKey: 'revista_id'
});
NumeroRevista.belongsTo(Revista, {
    foreignKey: 'revista_id'
});

// numeros_revista.id < articulos.numero_id
NumeroRevista.hasMany(Articulo, {
    foreignKey: 'numero_id'
});
Articulo.belongsTo(NumeroRevista, {
    foreignKey: 'numero_id'
});

// articulos.id < autores_secundarios.articulo_id
Articulo.hasMany(AutorSecundario, {
    foreignKey: 'articulo_id'
});
AutorSecundario.belongsTo(Articulo, {
    foreignKey: 'articulo_id'
});

// usuarios.id < autores_secundarios.usuario_id
Usuario.hasMany(AutorSecundario, {
    foreignKey: 'usuario_id'
});
AutorSecundario.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

// articulos.id < archivos_articulos.articulo_id
Articulo.hasMany(ArchivoArticulo, {
    foreignKey: 'articulo_id'
});
ArchivoArticulo.belongsTo(Articulo, {
    foreignKey: 'articulo_id'
});

// articulos.id < evaluaciones.articulo_id
Articulo.hasMany(Evaluacion, {
    foreignKey: 'articulo_id'
});
Evaluacion.belongsTo(Articulo, {
    foreignKey: 'articulo_id'
});

// usuarios.id < evaluaciones.revisor_id
Usuario.hasMany(Evaluacion, {
    foreignKey: 'revisor_id',
    as: 'evaluaciones_realizadas'
});
Evaluacion.belongsTo(Usuario, {
    foreignKey: 'revisor_id',
    as: 'revisor'
});

export {
    Usuario,
    Area,
    Programa,
    LineaInvestigacion,
    Revista,
    Articulo,
    AutorSecundario,
    ArchivoArticulo,
    Evaluacion,
    NumeroRevista
};