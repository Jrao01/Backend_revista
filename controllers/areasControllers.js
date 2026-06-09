import { Area, Programa, LineaInvestigacion } from '../models/index.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

export const createArea = async (req, res) => {
  try {
    const { nombre, color_institucional, status } = req.body;

    const area = await Area.create({
      nombre,
      color_institucional,
      status
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
          as: 'programas'
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
          as: 'programas'
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
    const { nombre, color_institucional, status } = req.body;

    const area = await Area.findByPk(id);

    if (!area) {
      return errorResponse(res, 'Área no encontrada', 404);
    }

    await area.update({
      nombre,
      color_institucional,
      status
    });

    // Cascade: if area is disabled, disable all its programs and their lines
    if (status === false) {
      const programas = await Programa.findAll({ where: { area_id: id } });
      for (const prog of programas) {
        await prog.update({ status: false });
        await LineaInvestigacion.update({ status: false }, { where: { programa_id: prog.id } });
      }
    }

    return successResponse(res, 'Área actualizada correctamente', area);
  } catch (error) {
    return errorResponse(res, 'Error al actualizar el área', 500, error.message);
  }
};

export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id, {
      include: [{ model: Programa, as: 'programas' }]
    });

    if (!area) {
      return errorResponse(res, 'Área no encontrada', 404);
    }

    if (area.programas && area.programas.length > 0) {
      return errorResponse(res, 'No se puede eliminar el área porque tiene programas asociados', 400);
    }

    await area.destroy();

    return successResponse(res, 'Área eliminada correctamente');
  } catch (error) {
    return errorResponse(res, 'Error al eliminar el área', 500, error.message);
  }
};
