import { Programa, Area } from "../models/index.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getProgramas = async (req, res) => {
    try {
        const programas = await Programa.findAll({
            include: [
                {
                    model: Area,
                    as: "areas"
                }
            ]
        });

        return successResponse(
            res,
            "Programas obtenidos exitosamente",
            programas
        );
    } catch (error) {
        console.log(error);
        return errorResponse(
            res,
            "Error al obtener programas",
            500,
            error.message
        );
    }
};

export const getProgramaById = async (req, res) => {
    try {
        const { id } = req.params;

        const programa = await Programa.findByPk(id, {
            include: [
                {
                    model: Area,
                    as: "areas"
                }
            ]
        });

        if (!programa) {
            return errorResponse(
                res,
                "Programa no encontrado",
                404
            );
        }

        return successResponse(
            res,
            "Programa obtenido exitosamente",
            programa
        );
    } catch (error) {
        console.log(error);
        return errorResponse(
            res,
            "Error al obtener el programa",
            500,
            error.message
        );
    }
};

export const crearPrograma = async (req, res) => {
    try {
        const { nombre } = req.body;

        const programa = await Programa.create({
            nombre
        });

        return successResponse(
            res,
            "Programa creado exitosamente",
            programa,
            201
        );
    } catch (error) {
        console.log(error);
        return errorResponse(
            res,
            "Error al crear el programa",
            500,
            error.message
        );
    }
};

export const actualizarPrograma = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const programa = await Programa.findByPk(id);

        if (!programa) {
            return errorResponse(
                res,
                "Programa no encontrado",
                404
            );
        }

        await programa.update({
            nombre
        });

        return successResponse(
            res,
            "Programa actualizado exitosamente",
            programa
        );
    } catch (error) {
        console.log(error);
        return errorResponse(
            res,
            "Error al actualizar el programa",
            500,
            error.message
        );
    }
};

export const eliminarPrograma = async (req, res) => {
    try {
        const { id } = req.params;

        const programa = await Programa.findByPk(id, {
            include: [
                {
                    model: Area,
                    as: "areas"
                }
            ]
        });

        if (!programa) {
            return errorResponse(
                res,
                "Programa no encontrado",
                404
            );
        }

        if (programa.areas && programa.areas.length > 0) {
            return errorResponse(
                res,
                "No se puede eliminar el programa porque tiene áreas asociadas",
                400
            );
        }

        await programa.destroy();

        return successResponse(
            res,
            "Programa eliminado exitosamente"
        );
    } catch (error) {
        console.log(error);
        return errorResponse(
            res,
            "Error al eliminar el programa",
            500,
            error.message
        );
    }
};