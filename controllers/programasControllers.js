import { Programa, Area, LineaInvestigacion } from "../models/index.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getProgramas = async (req, res) => {
    try {
        const programas = await Programa.findAll({
            include: [
                { model: Area, as: "area" },
                { model: LineaInvestigacion, as: "lineas" }
            ],
            order: [['id', 'ASC']]
        });

        return successResponse(res, "Programas obtenidos exitosamente", programas);
    } catch (error) {
        return errorResponse(res, "Error al obtener programas", 500, error.message);
    }
};

export const getProgramaById = async (req, res) => {
    try {
        const { id } = req.params;

        const programa = await Programa.findByPk(id, {
            include: [
                { model: Area, as: "area" },
                { model: LineaInvestigacion, as: "lineas" }
            ]
        });

        if (!programa) {
            return errorResponse(res, "Programa no encontrado", 404);
        }

        return successResponse(res, "Programa obtenido exitosamente", programa);
    } catch (error) {
        return errorResponse(res, "Error al obtener el programa", 500, error.message);
    }
};

export const crearPrograma = async (req, res) => {
    try {
        const { area_id, nombre, status } = req.body;

        const area = await Area.findByPk(area_id);
        if (!area) {
            return errorResponse(res, 'El área indicada no existe', 404);
        }

        const programa = await Programa.create({ area_id, nombre, status });

        return successResponse(res, "Programa creado exitosamente", programa, 201);
    } catch (error) {
        return errorResponse(res, "Error al crear el programa", 500, error.message);
    }
};

export const actualizarPrograma = async (req, res) => {
    try {
        const { id } = req.params;
        const { area_id, nombre, status } = req.body;

        const programa = await Programa.findByPk(id);

        if (!programa) {
            return errorResponse(res, "Programa no encontrado", 404);
        }

        if (area_id) {
            const area = await Area.findByPk(area_id);
            if (!area) {
                return errorResponse(res, 'El área indicada no existe', 404);
            }
        }

        // Cannot activate a program if its parent area is disabled
        if (status === true) {
            const aId = area_id || programa.area_id;
            const area = await Area.findByPk(aId);
            if (area && area.status === false) {
                return errorResponse(res, 'No se puede activar un programa cuyo área está deshabilitada', 400);
            }
        }

        await programa.update({ area_id, nombre, status });

        // Cascade: if program is disabled, disable all its lines
        if (status === false) {
            await LineaInvestigacion.update({ status: false }, { where: { programa_id: id } });
        }

        return successResponse(res, "Programa actualizado exitosamente", programa);
    } catch (error) {
        return errorResponse(res, "Error al actualizar el programa", 500, error.message);
    }
};

export const eliminarPrograma = async (req, res) => {
    try {
        const { id } = req.params;

        const programa = await Programa.findByPk(id, {
            include: [{ model: LineaInvestigacion, as: "lineas" }]
        });

        if (!programa) {
            return errorResponse(res, "Programa no encontrado", 404);
        }

        if (programa.lineas && programa.lineas.length > 0) {
            return errorResponse(res, "No se puede eliminar el programa porque tiene líneas asociadas", 400);
        }

        await programa.destroy();

        return successResponse(res, "Programa eliminado exitosamente");
    } catch (error) {
        return errorResponse(res, "Error al eliminar el programa", 500, error.message);
    }
};
