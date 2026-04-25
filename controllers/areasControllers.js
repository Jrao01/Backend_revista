import { Area } from "../models/index.js";

export const getAreas = async (req, res) => {
    try {
        const areas = await Area.findAll();
        res.json(areas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener áreas", error: error.message });
    }
};

export const crearArea = async (req, res) => {
    try {
        const { nombre, color_institucional } = req.body;
        const area = await Area.create({ nombre, color_institucional });
        res.status(201).json({ message: "Área creada exitosamente", area });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al crear el área", error: error.message });
    }
};

export const actualizarArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, color_institucional } = req.body;

        const area = await Area.findByPk(id);
        if (!area) {
            return res.status(404).json({ message: "Área no encontrada" });
        }

        if (nombre) area.nombre = nombre;
        if (color_institucional !== undefined) area.color_institucional = color_institucional;

        await area.save();
        res.json({ message: "Área actualizada exitosamente", area });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el área", error: error.message });
    }
};
