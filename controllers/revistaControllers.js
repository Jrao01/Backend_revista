import { Revista, Volumen, NumeroRevista } from "../models/index.js";

export const getRevistas = async (req, res) => {
    try {
        const revistas = await Revista.findAll({
            where: { activo: true },
            include: [
                {
                    model: Volumen,
                    as: 'volumenes',
                    attributes: ['id', 'numero_volumen']
                }
            ],
            order: [[{ model: Volumen, as: 'volumenes' }, 'numero_volumen', 'DESC']]
        });
        res.json(revistas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener revistas", error: error.message });
    }
};

export const getAllRevistasAdmin = async (req, res) => {
    try {
        const revistas = await Revista.findAll({
            include: [
                {
                    model: Volumen,
                    as: 'volumenes',
                    attributes: ['id', 'numero_volumen'],
                    include: [
                        {
                            model: NumeroRevista,
                            as: 'numeros',
                            attributes: ['id', 'numero', 'anio', 'titulo_edicion', 'status', 'fecha_publicacion']
                        }
                    ]
                }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json(revistas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener revistas", error: error.message });
    }
};

export const getRevistaById = async (req, res) => {
    try {
        const { id } = req.params;
        const revista = await Revista.findByPk(id, {
            include: [
                {
                    model: Volumen,
                    as: 'volumenes',
                    attributes: ['id', 'numero_volumen'],
                    include: [
                        {
                            model: NumeroRevista,
                            as: 'numeros',
                            attributes: ['id', 'numero', 'anio', 'titulo_edicion', 'status', 'fecha_publicacion']
                        }
                    ]
                }
            ]
        });

        if (!revista) {
            return res.status(404).json({ message: "Revista no encontrada" });
        }

        res.json(revista);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la revista", error: error.message });
    }
};

export const crearRevista = async (req, res) => {
    try {
        const { nombre, issn, periodicidad, descripcion, lineas_permitidas } = req.body;
        const revista = await Revista.create({
            nombre,
            issn,
            periodicidad,
            descripcion,
            lineas_permitidas
        });
        res.status(201).json({ message: "Revista creada exitosamente", revista });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la revista", error: error.message });
    }
};

export const actualizarRevista = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, issn, periodicidad, descripcion, lineas_permitidas, activo } = req.body;

        const revista = await Revista.findByPk(id);
        if (!revista) return res.status(404).json({ message: "Revista no encontrada" });

        if (nombre !== undefined) revista.nombre = nombre;
        if (issn !== undefined) revista.issn = issn;
        if (periodicidad !== undefined) revista.periodicidad = periodicidad;
        if (descripcion !== undefined) revista.descripcion = descripcion;
        if (lineas_permitidas !== undefined) revista.lineas_permitidas = lineas_permitidas;
        if (activo !== undefined) revista.activo = activo;

        await revista.save();
        res.json({ message: "Revista actualizada", revista });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la revista", error: error.message });
    }
};

export const desactivarRevista = async (req, res) => {
    try {
        const { id } = req.params;
        const revista = await Revista.findByPk(id);
        if (!revista) return res.status(404).json({ message: "Revista no encontrada" });

        revista.activo = false;
        await revista.save();
        res.json({ message: "Revista desactivada correctamente", revista });
    } catch (error) {
        res.status(500).json({ message: "Error al desactivar la revista", error: error.message });
    }
};

export const activarRevista = async (req, res) => {
    try {
        const { id } = req.params;
        const revista = await Revista.findByPk(id);
        if (!revista) return res.status(404).json({ message: "Revista no encontrada" });

        revista.activo = true;
        await revista.save();
        res.json({ message: "Revista activada correctamente", revista });
    } catch (error) {
        res.status(500).json({ message: "Error al activar la revista", error: error.message });
    }
};
