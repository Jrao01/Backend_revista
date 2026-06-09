import { LineaInvestigacion, Programa } from '../models/index.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

export const createLinea = async (req, res) => {
  try {
    const { programa_id, nombre, status } = req.body;

    const programa = await Programa.findByPk(programa_id);

    if (!programa) {
      return errorResponse(res, 'El programa indicado no existe', 404);
    }

    const linea = await LineaInvestigacion.create({
      programa_id,
      nombre,
      status
    });

    return successResponse(res, 'Línea de investigación creada correctamente', linea, 201);
  } catch (error) {
    return errorResponse(res, 'Error al crear la línea de investigación', 500, error.message);
  }
};

export const listLineas = async (req, res) => {
  try {
    const lineas = await LineaInvestigacion.findAll({
      include: [
        {
          model: Programa,
          as: 'programa'
        }
      ],
      order: [['id', 'ASC']]
    });

    return successResponse(res, 'Líneas de investigación listadas correctamente', lineas);
  } catch (error) {
    return errorResponse(res, 'Error al listar las líneas de investigación', 500, error.message);
  }
};

export const getLineaById = async (req, res) => {
  try {
    const { id } = req.params;

    const linea = await LineaInvestigacion.findByPk(id, {
      include: [
        {
          model: Programa,
          as: 'programa'
        }
      ]
    });

    if (!linea) {
      return errorResponse(res, 'Línea de investigación no encontrada', 404);
    }

    return successResponse(res, 'Línea de investigación obtenida correctamente', linea);
  } catch (error) {
    return errorResponse(res, 'Error al obtener la línea de investigación', 500, error.message);
  }
};

export const updateLinea = async (req, res) => {
  try {
    const { id } = req.params;
    const { programa_id, nombre, status } = req.body;

    const linea = await LineaInvestigacion.findByPk(id);

    if (!linea) {
      return errorResponse(res, 'Línea de investigación no encontrada', 404);
    }

    if (programa_id) {
      const programa = await Programa.findByPk(programa_id);
      if (!programa) {
        return errorResponse(res, 'El programa indicado no existe', 404);
      }
    }

    // Cannot activate a line if its parent program is disabled
    if (status === true) {
      const progId = programa_id || linea.programa_id;
      const programa = await Programa.findByPk(progId);
      if (programa && programa.status === false) {
        return errorResponse(res, 'No se puede activar una línea cuyo programa está deshabilitado', 400);
      }
    }

    await linea.update({ programa_id, nombre, status });

    return successResponse(res, 'Línea de investigación actualizada correctamente', linea);
  } catch (error) {
    return errorResponse(res, 'Error al actualizar la línea de investigación', 500, error.message);
  }
};

export const deleteLinea = async (req, res) => {
  try {
    const { id } = req.params;

    const linea = await LineaInvestigacion.findByPk(id);

    if (!linea) {
      return errorResponse(res, 'Línea de investigación no encontrada', 404);
    }

    await linea.destroy();

    return successResponse(res, 'Línea de investigación eliminada correctamente');
  } catch (error) {
    return errorResponse(res, 'Error al eliminar la línea de investigación', 500, error.message);
  }
};
