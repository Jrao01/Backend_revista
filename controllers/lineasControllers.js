import { LineaInvestigacion, Area } from "../models/index.js";

export const getLineas = async (req, res) => {
    try {
        const lineas = await LineaInvestigacion.findAll({
            include: [{ model: Area }]
        });
        res.json(lineas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener líneas de investigación", error: error.message });
    }
};

export const crearLinea = async (req, res) => {
    try {
        const { nombre, area_id, tipo } = req.body;
        const linea = await LineaInvestigacion.create({ nombre, area_id, tipo });
        res.status(201).json({ message: "Línea de investigación creada exitosamente", linea });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al crear la línea de investigación", error: error.message });
    }
};

export const actualizarLinea = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, area_id, tipo } = req.body;

        const linea = await LineaInvestigacion.findByPk(id);
        if (!linea) {
            return res.status(404).json({ message: "Línea de investigación no encontrada" });
        }

        if (nombre) linea.nombre = nombre;
        if (area_id) linea.area_id = area_id;
        if (tipo) linea.tipo = tipo;

        await linea.save();
        res.json({ message: "Línea de investigación actualizada exitosamente", linea });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar la línea de investigación", error: error.message });
    }
};
