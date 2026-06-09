import { Op, fn, col } from 'sequelize';
import {
    Articulo,
    ArchivoArticulo,
    NumeroRevista,
    Volumen,
    Revista,
    Usuario,
    AutorSecundario,
    LineaInvestigacion,
    Evaluacion
} from "../models/index.js";

// Registrar un artículo nuevo junto con su archivo principal
export const postArticle = async (req, res) => {
    try {
        const {
            revista_id,
            linea_id,
            titulo_es,
            titulo_en,
            resumen_es,
            resumen_en,
            palabras_clave,
            es_anonimo,
            firma_originalidad,
            firma_etica
        } = req.body;

        const autorId = req.usuario ? req.usuario.id : req.body.autor_principal_id;

        if (!autorId) {
            return res.status(400).json({ message: "Falta proporcionar el ID del autor principal" });
        }

        if (!linea_id) {
            return res.status(400).json({ message: "La línea de investigación es requerida" });
        }

        const linea = await LineaInvestigacion.findByPk(linea_id);
        if (!linea) {
            return res.status(400).json({ message: "Línea de investigación no encontrada" });
        }

        const firmaOriginalidad = firma_originalidad === 'true' || firma_originalidad === true;
        const firmaEtica = firma_etica === 'true' || firma_etica === true;

        const articulo = await Articulo.create({
            revista_id,
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
            if (req.files.img && req.files.img[0]) {
                await articulo.update({ img: req.files.img[0].path.replace(/\\/g, '/') });
            }

            const archivosPermitidos = [
                'manuscrito_original',
                'manuscrito_anonimizado',
                'ficha_autores',
                'material_suplementario'
            ];

            for (const fieldName of archivosPermitidos) {
                if (req.files[fieldName]) {
                    archivosCreados.push(await ArchivoArticulo.create({
                        articulo_id: articulo.id,
                        tipo_archivo: fieldName,
                        url: req.files[fieldName][0].path.replace(/\\/g, '/'),
                        version: 1,
                        es_anonimo: fieldName === 'manuscrito_anonimizado' ? true : anonimo
                    }));
                }
            }
        }

        // Crear coautores si se proporcionaron
        const coautoresCreados = [];
        if (req.body.coautores) {
            let coautorIds = [];
            try {
                coautorIds = JSON.parse(req.body.coautores);
            } catch (_) {
                coautorIds = [];
            }
            if (Array.isArray(coautorIds) && coautorIds.length > 0) {
                for (const uid of coautorIds) {
                    const userExists = await Usuario.findByPk(parseInt(uid));
                    if (userExists) {
                        coautoresCreados.push(await AutorSecundario.create({
                            articulo_id: articulo.id,
                            usuario_id: parseInt(uid)
                        }));
                    }
                }
            }
        }

        res.status(201).json({
            message: "Artículo registrado exitosamente",
            articulo,
            archivos: archivosCreados,
            coautores: coautoresCreados
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
            url: req.file.path.replace(/\\/g, '/'),
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
                    model: Revista,
                    as: 'revista'
                },
                {
                    model: Usuario,
                    as: 'autor_principal',
                    attributes: { exclude: ['password'] }
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: { exclude: ['password'] }
                    }]
                }
            ]
        });

        if (!articulo || articulo.status !== 'publicado') {
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

const makeSlug = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

export const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const allArticles = await Articulo.findAll({
            include: [
                { model: ArchivoArticulo },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{ model: Volumen, as: 'volumen' }]
                },
                {
                    model: Revista,
                    as: 'revista'
                },
                {
                    model: Usuario,
                    as: 'autor_principal',
                    attributes: { exclude: ['password'] }
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: { exclude: ['password'] }
                    }]
                }
            ]
        });

        const match = allArticles.find(a => makeSlug(a.titulo_es) === slug && a.status === 'publicado');
        if (!match) {
            return res.status(404).json({ message: "Artículo no encontrado" });
        }
        res.json(match);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener el artículo", error: error.message });
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
        const { numero_revista_id } = req.query;
        const where = {};
        if (numero_revista_id) where.numero_revista_id = parseInt(numero_revista_id, 10);
        const articulos = await Articulo.findAll({
            where,
            include: [
                { model: ArchivoArticulo },
                {
                    model: Evaluacion,
                    as: 'evaluaciones',
                    attributes: ['id']
                },
                {
                    model: Usuario,
                    as: 'autor_principal',
                    attributes: ['id', 'nombre', 'apellido', 'correo']
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: ['id', 'nombre', 'apellido', 'correo']
                    }]
                },
                {
                    model: LineaInvestigacion,
                    attributes: ['id', 'nombre']
                },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{
                        model: Volumen,
                        as: 'volumen',
                        attributes: ['id', 'numero_volumen'],
                        include: [{
                            model: Revista,
                            as: 'revista',
                            attributes: ['id', 'nombre']
                        }]
                    }]
                }
            ],
            order: [['fecha_recepcion', 'DESC']]
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
                { model: ArchivoArticulo },
                {
                    model: Usuario,
                    as: 'autor_principal',
                    attributes: ['id', 'nombre', 'apellido', 'correo']
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: ['id', 'nombre', 'apellido', 'correo']
                    }]
                },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{
                        model: Volumen,
                        as: 'volumen',
                        attributes: ['id', 'numero_volumen']
                    }]
                },
                { model: LineaInvestigacion, as: 'lineas_investigacion', attributes: ['id', 'nombre'] }
            ],
            order: [['fecha_recepcion', 'DESC']]
        });
        res.json(articulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener los artículos aprobados",
            error: error.message
        });
    }
};

export const getArticulosPublicados = async (req, res) => {
    try {
        const { revistaId } = req.query;
        const articulos = await Articulo.findAll({
            where: { status: 'publicado' },
            include: [
                { model: ArchivoArticulo },
                {
                    model: Usuario,
                    as: 'autor_principal',
                    attributes: ['id', 'nombre', 'apellido', 'correo']
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: ['id', 'nombre', 'apellido']
                    }]
                },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    required: true,
                    where: { status: 'publicado' },
                    include: [{
                        model: Volumen,
                        as: 'volumen',
                        required: true,
                        include: [{
                            model: Revista,
                            as: 'revista',
                            attributes: ['id', 'nombre'],
                            where: revistaId ? { id: parseInt(revistaId) } : undefined,
                            required: !!revistaId
                        }]
                    }]
                },
                { model: LineaInvestigacion, attributes: ['id', 'nombre'] }
            ],
            order: [['fecha_recepcion', 'DESC']]
        });
        res.json(articulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al obtener los artículos publicados",
            error: error.message
        });
    }
};

// Asignar artículo a un número (ruta anidada bajo revista/volumen/número)
export const asignarArticuloANumero = async (req, res) => {
    try {
        const { revId, volId, numId } = req.params;
        const { articulo_id, doi } = req.body;

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
        if (doi !== undefined && doi !== null && doi !== '') {
            articulo.doi = doi;
        }
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
        const { numero_revista_id, numero_id, doi } = req.body;
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
        if (doi !== undefined && doi !== null && doi !== '') {
            articulo.doi = doi;
        }
        await articulo.save();

        res.json({ message: 'Artículo asignado correctamente', articulo });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al asignar artículo', error: error.message });
    }
};

// Artículos relacionados: misma línea → mismo programa → cualquier artículo
export const getRelatedArticles = async (req, res) => {
    try {
        const { id } = req.params;
        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        const commonInclude = [
            {
                model: Usuario,
                as: 'autor_principal',
                attributes: ['id', 'nombre', 'apellido']
            },
            {
                model: AutorSecundario,
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'apellido']
                }]
            },
            {
                model: LineaInvestigacion,
                as: 'lineas_investigacion',
                attributes: ['id', 'nombre']
            },
            {
                model: NumeroRevista,
                as: 'numero_revista',
                include: [{ model: Volumen, as: 'volumen', attributes: ['id', 'numero_volumen'] }]
            }
        ];
        const baseWhere = {
            id: { [Op.ne]: parseInt(id) },
            status: 'publicado'
        };

        // 1. Misma línea
        let related = await Articulo.findAll({
            where: { ...baseWhere, linea_id: articulo.linea_id },
            include: commonInclude,
            limit: 4,
            order: [['fecha_recepcion', 'DESC']]
        });

        // 2. Si no hay suficientes, buscar por misma línea
        if (related.length < 4) {
            const existingIds = related.map(a => a.id).concat([parseInt(id)]);
            const moreByLinea = await Articulo.findAll({
                where: { ...baseWhere, linea_id: articulo.linea_id, id: { [Op.notIn]: existingIds } },
                include: commonInclude,
                limit: 4 - related.length,
                order: [['fecha_recepcion', 'DESC']]
            });
            related = related.concat(moreByLinea);
        }

        // 3. Si aún no hay suficientes, los más recientes de la DB
        if (related.length < 4) {
            const existingIds = related.map(a => a.id).concat([parseInt(id)]);
            const latest = await Articulo.findAll({
                where: { ...baseWhere, id: { [Op.notIn]: existingIds } },
                include: commonInclude,
                limit: 4 - related.length,
                order: [['fecha_recepcion', 'DESC']]
            });
            related = related.concat(latest);
        }

        res.json(related);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener artículos relacionados', error: error.message });
    }
};

// Obtener artículos del usuario autenticado (investigador)
export const getMyManuscripts = async (req, res) => {
    try {
        const autorId = req.usuario.id;
        const articulos = await Articulo.findAll({
            where: { autor_principal_id: autorId },
            include: [
                { model: ArchivoArticulo },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: ['id', 'nombre', 'apellido']
                    }]
                },
                {
                    model: LineaInvestigacion,
                    attributes: ['id', 'nombre']
                },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{
                        model: Volumen,
                        as: 'volumen',
                        attributes: ['id', 'numero_volumen']
                    }]
                }
            ],
            order: [['fecha_recepcion', 'DESC']]
        });
        res.json(articulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener tus manuscritos', error: error.message });
    }
};

// Rechazar artículo (editor): crea registro en evaluaciones + cambia status
export const rechazarArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { observaciones_editor, observaciones_autor } = req.body;
        const editorId = req.usuario.id;

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        if (articulo.status === 'rechazado') {
            return res.status(400).json({ message: 'El artículo ya ha sido rechazado' });
        }

        await Evaluacion.create({
            articulo_id: articulo.id,
            revisor_id: editorId,
            veredicto: 'rechazado',
            observaciones_editor: observaciones_editor || '',
            observaciones_autor: observaciones_autor || '',
            fecha_evaluacion: new Date()
        });

        articulo.status = 'rechazado';
        await articulo.save();

        res.json({ message: 'Artículo rechazado exitosamente', articulo });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al rechazar el artículo', error: error.message });
    }
};

// Re-subida de archivos por el autor (cuando está por_corregir)
export const reUploadFiles = async (req, res) => {
    try {
        const { id } = req.params;
        const { version } = req.body;

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        if (articulo.status !== 'por_corregir') {
            return res.status(400).json({ message: 'Solo puedes re-subir archivos cuando el estado es "por corregir"' });
        }

        const archivosCreados = [];
        const archivosPermitidos = [
            'manuscrito_corregido'
        ];

        const versionNum = version ? parseInt(version) : 2;

        if (req.files) {
            for (const fieldName of archivosPermitidos) {
                if (req.files[fieldName]) {
                    archivosCreados.push(await ArchivoArticulo.create({
                        articulo_id: articulo.id,
                        tipo_archivo: 'manuscrito_corregido',
                        url: req.files[fieldName][0].path.replace(/\\/g, '/'),
                        version: versionNum,
                        es_anonimo: false
                    }));
                }
            }
        }

        articulo.status = 'Corregido';
        await articulo.save();

        res.json({
            message: 'Archivos re-subidos exitosamente. El artículo está listo para revisión.',
            articulo,
            archivos: archivosCreados
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al re-subir archivos', error: error.message });
    }
};

// Obtener detalle completo de un artículo para admin/editor (sin restricción de status)
export const getArticleAdminDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const articulo = await Articulo.findByPk(id, {
            include: [
                { model: ArchivoArticulo },
                {
                    model: NumeroRevista,
                    as: 'numero_revista',
                    include: [{ model: Volumen, as: 'volumen', include: [{ model: Revista, as: 'revista' }] }]
                },
                {
                    model: Revista,
                    as: 'revista'
                },
                {
                    model: Usuario,
                    as: 'autor_principal',
                    attributes: { exclude: ['password'] }
                },
                {
                    model: AutorSecundario,
                    include: [{
                        model: Usuario,
                        attributes: { exclude: ['password'] }
                    }]
                },
                {
                    model: LineaInvestigacion,
                    as: 'lineas_investigacion',
                    attributes: ['id', 'nombre']
                },
                {
                    model: Evaluacion,
                    as: 'evaluaciones',
                    include: [{
                        model: Usuario,
                        as: 'revisor',
                        attributes: ['id', 'nombre', 'apellido', 'correo']
                    }]
                }
            ]
        });

        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        res.json(articulo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener el artículo', error: error.message });
    }
};

// Obtener evaluaciones de un artículo propio (solo el autor)
export const getMyArticleEvaluations = async (req, res) => {
    try {
        const { id } = req.params;
        const autorId = req.usuario.id;

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        if (articulo.autor_principal_id !== autorId) {
            return res.status(403).json({ message: 'No tienes acceso a las evaluaciones de este artículo' });
        }

        const evaluaciones = await Evaluacion.findAll({
            where: { articulo_id: id },
            include: [
                { model: Usuario, as: 'revisor', attributes: ['id', 'nombre', 'apellido', 'correo'] }
            ],
            order: [['id', 'ASC']]
        });

        res.json(evaluaciones);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener evaluaciones', error: error.message });
    }
};