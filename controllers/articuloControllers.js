import {
    Articulo,
    ArchivoArticulo,
    NumeroRevista,
    Volumen,
    Usuario,
    AutorSecundario
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
            es_anonimo,
            firma_originalidad,
            firma_etica
        } = req.body;

        // Determinar el autor principal: del body o del usuario logueado
        const autorId = req.usuario ? req.usuario.id : autor_principal_id;

        if (!autorId) {
            return res.status(400).json({
                message: "Falta proporcionar el ID del autor principal"
            });
        }

        const firmaOriginalidad = firma_originalidad === 'true' || firma_originalidad === true;
        const firmaEtica = firma_etica === 'true' || firma_etica === true;

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
            firma_originalidad: firmaOriginalidad,
            firma_etica: firmaEtica,
            fecha_recepcion: new Date(),
        });

        // Si existen archivos adjuntos, guardar las referencias en la base de datos
        const archivosCreados = [];
        const anonimo = es_anonimo === 'true' || es_anonimo === true;

        if (req.files) {
            const archivosPermitidos = [
                'manuscrito_original',
                'pagina_titulo',
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
            include: [
                { model: ArchivoArticulo },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{ model: Volumen, as: 'volumen' }]
                },
                {
                    model: Usuario,
                    as: 'autor_principal'
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario
                    }]
                }
            ]
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
            linea_id,
            img
        } = req.body;

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({
                message: "Artículo no encontrado"
            });
        }

        // Restricción: Solo se puede editar si el artículo está en estado 'por_corregir'
        if (articulo.status !== 'por_corregir') {
            return res.status(400).json({
                message: "Solo se puede editar el artículo si se encuentra en estado 'por_corregir'"
            });
        }

        if (titulo_es) articulo.titulo_es = titulo_es;
        if (titulo_en !== undefined) articulo.titulo_en = titulo_en;
        if (resumen_es !== undefined) articulo.resumen_es = resumen_es;
        if (resumen_en !== undefined) articulo.resumen_en = resumen_en;
        if (palabras_clave !== undefined) articulo.palabras_clave = palabras_clave;
        if (programa_id) articulo.programa_id = programa_id;
        if (linea_id) articulo.linea_id = linea_id;

        // Soporte para subir o actualizar la imagen de portada/cover
        if (req.file) {
            articulo.img = req.file.path;
        } else if (img !== undefined) {
            articulo.img = img;
        }

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
        const articulos = await Articulo.findAll({
            include: [
                { model: ArchivoArticulo },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{ model: Volumen, as: 'volumen' }]
                },
                {
                    model: Usuario,
                    as: 'autor_principal'
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario
                    }]
                }
            ]
        });
        res.json(articulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener los artículos",
            error: error.message
        });
    }
};

export const getArticulosAprobados = async (req, res) => {
    try {
        const { revistaId } = req.query || {};
        const whereClause = { status: 'aprobado' };
        if (revistaId) {
            whereClause.revista_id = parseInt(revistaId);
        }
        const articulos = await Articulo.findAll({
            where: whereClause,
            include: [
                {
                    model: ArchivoArticulo
                },
                {
                    model: Usuario,
                    as: 'autor_principal'
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario
                    }]
                }
            ]
        });
        res.json(articulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener artículos aprobados",
            error: error.message
        });
    }
};

// Asignar artículo a un número (ruta anidada bajo revista/volumen/número)
export const asignarArticuloANumero = async (req, res) => {
    try {
        const { revId, volId, numId } = req.params;
        const { articulo_id } = req.body;

        if (!articulo_id) {
            return res.status(400).json({ message: 'articulo_id es requerido' });
        }

        const volumen = await Volumen.findOne({
            where: {
                id: parseInt(volId),
                revista_id: parseInt(revId)
            }
        });
        if (!volumen) {
            return res.status(404).json({
                message: 'Volumen no encontrado para esta revista'
            });
        }

        const numero = await NumeroRevista.findOne({
            where: {
                id: parseInt(numId),
                revista_id: parseInt(revId),
                volumen_id: volumen.id
            }
        });

        if (!numero) {
            return res.status(404).json({
                message: 'Número de revista no encontrado para el volumen indicado'
            });
        }

        const articulo = await Articulo.findByPk(articulo_id);
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        if (articulo.revista_id !== parseInt(revId)) {
            return res.status(400).json({ message: 'El artículo no pertenece a esta revista' });
        }

        articulo.numero_revista_id = numero.id;
        articulo.status = 'asignado';
        await articulo.save();

        res.status(200).json({
            message: 'Artículo asignado al número correctamente',
            articulo
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error al asignar artículo al número',
            error: error.message
        });
    }
};

// Compatibilidad: asignar por ID de artículo en params
export const assignArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_revista_id, numero_id } = req.body;
        const numeroRevistaId = numero_revista_id ?? numero_id;

        if (!numeroRevistaId) {
            return res.status(400).json({ message: 'numero_revista_id es requerido' });
        }

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        articulo.numero_revista_id = numeroRevistaId;
        articulo.status = 'asignado';
        await articulo.save();

        res.json({ message: 'Artículo asignado correctamente', articulo });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al asignar artículo', error: error.message });
    }
};