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
        const { nombre, issn, periodicidad } = req.body;
        const revista = await Revista.create({ nombre, issn, periodicidad });
        res.status(201).json({ message: "Revista creada exitosamente", revista });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la revista", error: error.message });
    }
};

export const actualizarRevista = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, issn, periodicidad } = req.body;

        const revista = await Revista.findByPk(id);
        if (!revista) return res.status(404).json({ message: "Revista no encontrada" });

        if (nombre) revista.nombre = nombre;
        if (issn) revista.issn = issn;
        if (periodicidad) revista.periodicidad = periodicidad;

        await revista.save();
        res.json({ message: "Revista actualizada", revista });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la revista", error: error.message });
    }
};
