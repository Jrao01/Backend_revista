import { LineaInvestigacion, Area } from '../models/index.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

export const createLinea = async (req, res) => {
  try {
    const { area_id, nombre, tipo } = req.body;

    const area = await Area.findByPk(area_id);

    if (!area) {
      return errorResponse(res, 'El área indicada no existe', 404);
    }

    const linea = await LineaInvestigacion.create({
      area_id,
      nombre,
      tipo
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
          model: Area,
          as: 'area'
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
          model: Area,
          as: 'area'
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
    const { area_id, nombre, tipo } = req.body;

    const linea = await LineaInvestigacion.findByPk(id);

    if (!linea) {
      return errorResponse(res, 'Línea de investigación no encontrada', 404);
    }

    if (area_id) {
      const area = await Area.findByPk(area_id);

      if (!area) {
        return errorResponse(res, 'El área indicada no existe', 404);
      }
    }

    await linea.update({
      area_id,
      nombre,
      tipo
    });

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