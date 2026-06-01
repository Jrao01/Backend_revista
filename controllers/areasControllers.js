import { Area, Programa, LineaInvestigacion } from '../models/index.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

export const createArea = async (req, res) => {
  try {
    const { programa_id, nombre, color_institucional } = req.body;

    const programa = await Programa.findByPk(programa_id);

    if (!programa) {
      return errorResponse(res, 'El programa indicado no existe', 404);
    }

    const area = await Area.create({
      programa_id,
      nombre,
      color_institucional
    });

    return successResponse(res, 'Área creada correctamente', area, 201);
  } catch (error) {
    return errorResponse(res, 'Error al crear el área', 500, error.message);
  }
};

export const listAreas = async (req, res) => {
  try {
    const areas = await Area.findAll({
      include: [
        {
          model: Programa,
          as: 'programa'
        },
        {
          model: LineaInvestigacion,
          as: 'lineas'
        }
      ],
      order: [['id', 'ASC']]
    });

    return successResponse(res, 'Áreas listadas correctamente', areas);
  } catch (error) {
    return errorResponse(res, 'Error al listar las áreas', 500, error.message);
  }
};

export const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id, {
      include: [
        {
          model: Programa,
          as: 'programa'
        },
        {
          model: LineaInvestigacion,
          as: 'lineas'
        }
      ]
    });

    if (!area) {
      return errorResponse(res, 'Área no encontrada', 404);
    }

    return successResponse(res, 'Área obtenida correctamente', area);
  } catch (error) {
    return errorResponse(res, 'Error al obtener el área', 500, error.message);
  }
};

export const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { programa_id, nombre, color_institucional } = req.body;

    const area = await Area.findByPk(id);

    if (!area) {
      return errorResponse(res, 'Área no encontrada', 404);
    }

    if (programa_id) {
      const programa = await Programa.findByPk(programa_id);

      if (!programa) {
        return errorResponse(res, 'El programa indicado no existe', 404);
      }
    }

    await area.update({
      programa_id,
      nombre,
      color_institucional
    });

    return successResponse(res, 'Área actualizada correctamente', area);
  } catch (error) {
    return errorResponse(res, 'Error al actualizar el área', 500, error.message);
  }
};

export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id);

    if (!area) {
      return errorResponse(res, 'Área no encontrada', 404);
    }

    await area.destroy();

    return successResponse(res, 'Área eliminada correctamente');
  } catch (error) {
    return errorResponse(res, 'Error al eliminar el área', 500, error.message);
  }
};