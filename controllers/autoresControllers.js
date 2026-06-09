import { Usuario, Articulo, AutorSecundario, ArchivoArticulo } from '../models/index.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

export const getAutorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Articulo,
          as: 'articulos_principales',
          where: { status: 'publicado' },
          required: false,
          include: [{ model: ArchivoArticulo }]
        }
      ]
    });

    if (!usuario) {
      return errorResponse(res, 'Autor no encontrado', 404);
    }

    // Get secondary author articles
    const secundarios = await AutorSecundario.findAll({
      where: { usuario_id: id },
      include: [{
        model: Articulo,
        where: { status: 'publicado' },
        required: false,
        include: [{ model: ArchivoArticulo }]
      }]
    });

    const articulosSecundarios = secundarios.map(s => s.Articulo);

    return successResponse(res, 'Perfil de autor obtenido correctamente', {
      ...usuario.toJSON(),
      articulos_secundarios: articulosSecundarios
    });
  } catch (error) {
    return errorResponse(res, 'Error al obtener el perfil del autor', 500, error.message);
  }
};

export const getAllAutores = async (req, res) => {
  try {
    const autores = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      where: { rol: 'investigador' }
    });

    return successResponse(res, 'Autores obtenidos correctamente', autores);
  } catch (error) {
    return errorResponse(res, 'Error al obtener autores', 500, error.message);
  }
};
