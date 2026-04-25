import { Programa, Area } from "../models/index.js";

export const getProgramas = async (req, res) => {
    try {
        const programas = await Programa.findAll({
            include: [{ model: Area }]
        });
        res.json(programas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener programas", error: error.message });
    }
};

export const crearPrograma = async (req, res) => {
    try {
        const { nombre, area_id } = req.body;
        const programa = await Programa.create({ nombre, area_id });
        res.status(201).json({ message: "Programa creado exitosamente", programa });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al crear el programa", error: error.message });
    }
};

export const actualizarPrograma = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, area_id } = req.body;

        const programa = await Programa.findByPk(id);
        if (!programa) {
            return res.status(404).json({ message: "Programa no encontrado" });
        }

        if (nombre) programa.nombre = nombre;
        if (area_id) programa.area_id = area_id;

        await programa.save();
        res.json({ message: "Programa actualizado exitosamente", programa });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el programa", error: error.message });
    }
};
