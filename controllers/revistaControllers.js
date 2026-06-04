import { Revista } from "../models/index.js";

export const getRevistas = async (req, res) => {
    try {
        const revistas = await Revista.findAll();
        res.json(revistas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener revistas", error: error.message });
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
