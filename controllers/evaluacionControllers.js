import { Evaluacion, Articulo, Usuario, ArchivoArticulo } from '../models/index.js';

// Listar evaluaciones (filtrable por articulo_id o revisor_id)
export const getEvaluaciones = async (req, res) => {
  try {
    const { articulo_id, revisor_id } = req.query;

    const where = {};
    if (articulo_id) where.articulo_id = parseInt(articulo_id, 10);
    if (revisor_id) where.revisor_id = parseInt(revisor_id, 10);

    const evaluaciones = await Evaluacion.findAll({
      where,
      include: [
        {
          model: Articulo,
          attributes: ['id', 'titulo_es', 'titulo_en', 'resumen_es', 'palabras_clave', 'status'],
          include: [
            { model: ArchivoArticulo }
          ]
        },
        { model: Usuario, as: 'revisor', attributes: ['id', 'nombre', 'correo'] }
      ],
      order: [['id', 'ASC']]
    });

    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar evaluaciones', error: error.message });
  }
};

// Obtener una evaluación por ID
export const getEvaluacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluacion = await Evaluacion.findByPk(id, {
      include: [
        {
          model: Articulo,
          attributes: ['id', 'titulo_es', 'titulo_en', 'resumen_es', 'palabras_clave', 'status'],
          include: [
            { model: ArchivoArticulo }
          ]
        },
        { model: Usuario, as: 'revisor', attributes: ['id', 'nombre', 'correo'] }
      ]
    });

    if (!evaluacion) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }

    res.json(evaluacion);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener evaluación', error: error.message });
  }
};

// El jurado (revisor) envía su veredicto
export const enviarVeredicto = async (req, res) => {
  try {
    const { id } = req.params;
    const { veredicto, observaciones_editor, observaciones_autor } = req.body;

    const evaluacion = await Evaluacion.findByPk(id);
    if (!evaluacion) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }

    // Solo el revisor asignado puede evaluar
    if (evaluacion.revisor_id !== req.usuario.id) {
      return res.status(403).json({ message: 'Solo el revisor asignado puede enviar su veredicto' });
    }

    // No permitir re-evaluar si ya tiene veredicto
    if (evaluacion.veredicto) {
      return res.status(400).json({ message: 'Esta evaluación ya fue completada. No se puede re-evaluar.' });
    }

    if (!veredicto || !['aprobado', 'corregir', 'rechazado'].includes(veredicto)) {
      return res.status(400).json({ message: 'El veredicto debe ser: aprobado, corregir o rechazado' });
    }

    evaluacion.veredicto = veredicto;
    evaluacion.observaciones_editor = observaciones_editor || null;
    evaluacion.observaciones_autor = observaciones_autor || null;
    evaluacion.fecha_evaluacion = new Date();
    await evaluacion.save();

    // Verificar si todos los revisores de este artículo ya evaluaron
    await verificarConsenso(evaluacion.articulo_id);

    const evaluacionActualizada = await Evaluacion.findByPk(id, {
      include: [
        { model: Articulo, attributes: ['id', 'titulo_es', 'status'] },
        { model: Usuario, as: 'revisor', attributes: ['id', 'nombre', 'correo'] }
      ]
    });

    res.json({ message: 'Veredicto registrado correctamente', evaluacion: evaluacionActualizada });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar veredicto', error: error.message });
  }
};

// Lógica de consenso: verifica si todos los revisores de la ronda actual evaluaron
const verificarConsenso = async (articuloId) => {
  // Solo considerar la ronda más reciente
  const maxRonda = await Evaluacion.max('ronda', { where: { articulo_id: articuloId } });
  if (!maxRonda) return;

  const evaluaciones = await Evaluacion.findAll({
    where: { articulo_id: articuloId, ronda: maxRonda }
  });

  // Si aún falta algún revisor que evalúe, no hacer nada
  const sinVeredicto = evaluaciones.filter(e => !e.veredicto);
  if (sinVeredicto.length > 0) return;

  const veredictos = evaluaciones.map(e => e.veredicto);

  const articulo = await Articulo.findByPk(articuloId);
  if (!articulo) return;

  // Regla de consenso:
  // - Si TODOS aprueban → aprobado
  // - Si TODOS rechazan → rechazado
  // - Si hay mixto o al menos uno dice "corregir" → por_corregir
  const todosAprobado = veredictos.every(v => v === 'aprobado');
  const todosRechazado = veredictos.every(v => v === 'rechazado');

  if (todosAprobado) {
    articulo.status = 'aprobado';
  } else if (todosRechazado) {
    articulo.status = 'rechazado';
  } else {
    articulo.status = 'por_corregir';
  }

  await articulo.save();
};

// Editor visualiza evaluaciones de un artículo (ruta protegida para editor)
export const getEvaluacionesByArticulo = async (req, res) => {
  try {
    const { id } = req.params; // articulo_id

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    const evaluaciones = await Evaluacion.findAll({
      where: { articulo_id: id },
      include: [
        { model: Usuario, as: 'revisor', attributes: ['id', 'nombre', 'correo'] }
      ],
      order: [['id', 'ASC']]
    });

    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener evaluaciones del artículo', error: error.message });
  }
};

// Eliminar una evaluación (solo editor/admin)
export const eliminarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluacion = await Evaluacion.findByPk(id);
    if (!evaluacion) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }

    if (evaluacion.veredicto) {
      return res.status(400).json({ message: 'No se puede eliminar una evaluación ya completada' });
    }

    await evaluacion.destroy();
    res.json({ message: 'Evaluación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evaluación', error: error.message });
  }
};
