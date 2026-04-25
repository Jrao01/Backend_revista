import {
    Articulo,
    ArchivoArticulo
} from "../models/index.js";

// Registrar un artículo nuevo junto con su archivo principal
export const postArticle = async (req, res) => {
    try {
        const {
            revista_id,
            programa_id,
            linea_id,
            autor_principal_id,
            titulo_es,
            titulo_en,
            resumen_es,
            resumen_en,
            palabras_clave,
            es_anonimo
        } = req.body;

        // Determinar el autor principal: del body o del usuario logueado
        const autorId = req.usuario ? req.usuario.id : autor_principal_id;

        if (!autorId) {
            return res.status(400).json({
                message: "Falta proporcionar el ID del autor principal"
            });
        }

        // Crear el registro del artículo
        const articulo = await Articulo.create({
            revista_id,
            programa_id,
            linea_id,
            autor_principal_id: autorId,
            titulo_es,
            titulo_en,
            resumen_es,
            resumen_en,
            palabras_clave,
            fecha_recepcion: new Date(),
        });

        // Si existen archivos adjuntos, guardar las referencias en la base de datos
        const archivosCreados = [];
        const anonimo = es_anonimo === 'true' || es_anonimo === true;

        if (req.files) {
            const archivosPermitidos = [
                'manuscrito_original',
                'pagina_titulo',
                'carta_originalidad',
                'ficha_autores',
                'material_suplementario'
            ];

            for (const fieldName of archivosPermitidos) {
                if (req.files[fieldName]) {
                    archivosCreados.push(await ArchivoArticulo.create({
                        articulo_id: articulo.id,
                        tipo_archivo: fieldName,
                        url: req.files[fieldName][0].path,
                        version: 1,
                        es_anonimo: anonimo
                    }));
                }
            }
        }

        res.status(201).json({
            message: "Artículo registrado exitosamente",
            articulo,
            archivos: archivosCreados
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al registrar el artículo",
            error: error.message
        });
    }
};

// Agregar un archivo a un artículo existente (por id en params)
export const postArchive = async (req, res) => {
    try {
        const {
            id
        } = req.params; // ID del artículo
        const {
            tipo_archivo,
            version,
            es_anonimo
        } = req.body;

        // Verificar si el artículo existe
        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({
                message: "Artículo no encontrado"
            });
        }

        // Verificar si se subió el archivo
        if (!req.file) {
            return res.status(400).json({
                message: "Debe proporcionar un archivo adjunto"
            });
        }

        // Crear el registro del archivo asociado al artículo
        const archivo = await ArchivoArticulo.create({
            articulo_id: articulo.id,
            tipo_archivo: tipo_archivo || '',
            url: req.file.path,
            version: version ? parseInt(version) : 1,
            es_anonimo: es_anonimo === 'true' || es_anonimo === true
        });

        res.status(201).json({
            message: "Archivo agregado al artículo exitosamente",
            archivo
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al registrar el archivo",
            error: error.message
        });
    }
};

export const getArticleById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const articulo = await Articulo.findByPk(id, {
            include: [{
                model: ArchivoArticulo
            }]
        });

        if (!articulo) {
            return res.status(404).json({
                message: "Artículo no encontrado"
            });
        }

        res.json(articulo);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener el artículo",
            error: error.message
        });
    }
};

export const updateArticle = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            titulo_es,
            titulo_en,
            resumen_es,
            resumen_en,
            palabras_clave,
            programa_id,
            linea_id
        } = req.body;

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({
                message: "Artículo no encontrado"
            });
        }

        if (titulo_es) articulo.titulo_es = titulo_es;
        if (titulo_en !== undefined) articulo.titulo_en = titulo_en;
        if (resumen_es !== undefined) articulo.resumen_es = resumen_es;
        if (resumen_en !== undefined) articulo.resumen_en = resumen_en;
        if (palabras_clave !== undefined) articulo.palabras_clave = palabras_clave;
        if (programa_id) articulo.programa_id = programa_id;
        if (linea_id) articulo.linea_id = linea_id;

        await articulo.save();

        res.json({
            message: "Artículo actualizado exitosamente",
            articulo
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al actualizar el artículo",
            error: error.message
        });
    }
};

export const getArticulos = async (req, res) => {
    try {
        const articulos = await Articulo.findAll();
        res.json(articulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener los artículos",
            error: error.message
        });
    }
};