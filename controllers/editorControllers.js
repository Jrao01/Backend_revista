import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    Articulo, 
    ArchivoArticulo, 
    Evaluacion, 
    Usuario,
    NumeroRevista
} from '../models/index.js';
import { generarGaleradaArticulo } from './galeradaControllers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// A. Desk Review e Informe de Plagio
export const realizarDeskReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { porcentaje_plagio } = req.body; // El editor ingresa el valor evaluado

    if (porcentaje_plagio === undefined) {
      return res.status(400).json({ message: "El porcentaje de plagio es requerido para el Desk Review." });
    }

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Regla de negocio inquebrantable: Plagio >= 30% se rechaza automáticamente
    if (parseFloat(porcentaje_plagio) >= 30) {
      articulo.status = 'rechazado';
      await articulo.save();
      return res.status(200).json({ 
        message: "Desk Review completado. Artículo rechazado por alto nivel de plagio (>= 30%).", 
        articulo 
      });
    }

    // Si pasa el filtro de plagio, el artículo queda listo para el siguiente paso (anonimizar)
    return res.status(200).json({ 
      message: "Desk Review completado con éxito (Plagio < 30%). El artículo es apto para anonimización.", 
      articulo 
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en el Desk Review", error: error.message });
  }
};

// B. Anonimización del Manuscrito (Carga del PDF ciego a archivos_articulos)
export const subirManuscritoAnonimo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Por favor, sube el manuscrito anonimizado." });
    }

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Regla de negocio (Inmutabilidad): Buscamos la última versión usando el ENUM exacto 'manuscrito_anonimizado'
    const ultimoArchivo = await ArchivoArticulo.findOne({
      where: { articulo_id: id, tipo_archivo: 'manuscrito_anonimizado' },
      order: [['version', 'DESC']]
    });

    const siguienteVersion = ultimoArchivo ? ultimoArchivo.version + 1 : 1;

    // Insertar el archivo usando la estructura de la base de datos de tus compañeros
    const nuevoArchivo = await ArchivoArticulo.create({
      articulo_id: id,
      tipo_archivo: 'manuscrito_anonimizado', // ENUM idéntico al de tu modelo
      url: req.file.path.replace(/\\/g, '/'),
      version: siguienteVersion,
      es_anonimo: true // BOOLEAN según tu modelo
    });

    // Actualizamos el estado general del artículo al ENUM válido 'en_revision'
    articulo.status = 'en_revision';
    await articulo.save();

    return res.status(200).json({ 
      message: `Manuscrito anonimizado cargado correctamente (Versión ${siguienteVersion}). Estado del artículo actualizado a 'en_revision'.`,
      archivo: nuevoArchivo
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al cargar manuscrito anónimo", error: error.message });
  }
};

// Cambiar estado general de un artículo (editor)
export const cambiarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validTransitions = ['en_revision', 'aprobado', 'por_corregir', 'rechazado', 'Corregido', 'enviado', 'En_evaluacion', 'publicado'];
        if (!validTransitions.includes(status)) {
            return res.status(400).json({ message: `Estado no válido: ${status}` });
        }

        const articulo = await Articulo.findByPk(id, {
            include: [
                { model: ArchivoArticulo },
                { model: NumeroRevista, as: 'numero_revista' }
            ]
        });
        if (!articulo) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        // Bloquear cambios manuales si ya está en evaluación por revisores
        if (articulo.status === 'En_evaluacion') {
            return res.status(400).json({ message: 'No se puede cambiar el estado manualmente. El artículo está en evaluación por revisores.' });
        }

        // Bloquear volver a estados anteriores si ya fue asignado a revisores
        if (articulo.status === 'aprobado' || articulo.status === 'rechazado') {
            return res.status(400).json({ message: `El artículo ya fue ${articulo.status === 'aprobado' ? 'aprobado' : 'rechazado'}. No se puede cambiar su estado.` });
        }

        // Si se aprueba, calcular páginas del manuscrito
        if (status === 'aprobado') {
            const manuscrito = await ArchivoArticulo.findOne({
                where: { articulo_id: id, tipo_archivo: 'manuscrito_corregido' },
                order: [['version', 'DESC']]
            }) || await ArchivoArticulo.findOne({
                where: { articulo_id: id, tipo_archivo: 'manuscrito_original' },
                order: [['version', 'DESC']]
            });

            if (manuscrito && manuscrito.url) {
                const filePath = path.join(__dirname, '..', manuscrito.url);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const lines = content.split(/\r?\n/).length;
                    const pages = Math.max(1, Math.ceil(lines / 40)); // ~40 líneas por página
                    articulo.pages = String(pages);
                }
            }
        }

        // Si se publica, requerir número asignado y generar galerada
        let galerada = null;
        if (status === 'publicado') {
            if (!articulo.numero_revista_id) {
                return res.status(400).json({ message: 'El artículo debe estar asignado a un número de revista antes de publicarse.' });
            }
            articulo.fecha_publicacion = new Date().toISOString().split('T')[0];
            galerada = await generarGaleradaArticulo(articulo.id);
        }

        articulo.status = status;
        await articulo.save();

        res.json({ message: `Estado del artículo actualizado a '${status}'`, articulo, galerada });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al cambiar el estado del artículo', error: error.message });
    }
};

// C. Asignación de Jurados Ciegos (Usa la tabla Evaluaciones)
export const asignarJurados = async (req, res) => {
  try {
    const { id } = req.params;
    const { juradosIds } = req.body; // Array de IDs de jurados: [4, 7]

    if (!Array.isArray(juradosIds) || juradosIds.length === 0) {
      return res.status(400).json({ message: "Debe proveer un arreglo 'juradosIds' con al menos un ID." });
    }

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Validación Doble Ciego Estricto: Asegurar que exista el manuscrito anonimizado antes de asignar jurados
    const tieneArchivoAnonimo = await ArchivoArticulo.findOne({
      where: { articulo_id: id, tipo_archivo: 'manuscrito_anonimizado', es_anonimo: true }
    });

    if (!tieneArchivoAnonimo) {
      return res.status(400).json({ message: "No se pueden asignar jurados si el manuscrito no ha sido anonimizado previamente." });
    }

    // Validar que todos los IDs correspondan a usuarios con rol 'revisor'
    for (const juradoId of juradosIds) {
      const usuario = await Usuario.findByPk(juradoId);
      if (!usuario || usuario.rol !== 'revisor') {
        return res.status(400).json({ message: `El usuario con ID ${juradoId} no existe o no tiene el rol de revisor.` });
      }
    }

    // Determinar la ronda actual: la máxima existente + 1, o 1 si no hay
    const maxRonda = await Evaluacion.max('ronda', { where: { articulo_id: id } });
    const ronda = maxRonda ? maxRonda + 1 : 1;

    // Mapear los datos respetando las columnas y el ENUM del modelo Evaluacion.js
    const nuevasEvaluaciones = juradosIds.map(juradoId => ({
      articulo_id: id,
      revisor_id: juradoId,
      veredicto: null,
      observaciones_editor: null,
      observaciones_autor: null,
      fecha_evaluacion: null,
      ronda
    }));

    await Evaluacion.bulkCreate(nuevasEvaluaciones);

    // Cambiar opcionalmente el estado del artículo a 'En_evaluacion' si su flujo lo requiere
    articulo.status = 'En_evaluacion'; 
    await articulo.save();

    return res.status(201).json({ message: "Jurados ciegos asignados exitosamente. El artículo pasó a estado 'En_evaluacion'.", ronda });
  } catch (error) {
    return res.status(500).json({ message: "Error al asignar los jurados", error: error.message });
  }
};

// D. Re-asignación para nueva ronda (cuando el editor aprueba correcciones)
export const reAsignarJurados = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    // Solo permitir si el artículo está Corregido
    if (articulo.status !== 'Corregido') {
      return res.status(400).json({ message: "Solo se puede re-asignar revisores cuando el artículo está en estado 'Corregido'." });
    }

    // Validar que exista un manuscrito anonimizado
    const tieneArchivoAnonimo = await ArchivoArticulo.findOne({
      where: { articulo_id: id, tipo_archivo: 'manuscrito_anonimizado', es_anonimo: true }
    });
    if (!tieneArchivoAnonimo) {
      return res.status(400).json({ message: "No hay manuscrito anonimizado para re-enviar a revisión." });
    }

    // Obtener los revisores de la ronda anterior
    const evaluacionesPrevias = await Evaluacion.findAll({
      where: { articulo_id: id },
      attributes: ['revisor_id'],
      group: ['revisor_id']
    });
    const revisorIds = evaluacionesPrevias.map(e => e.revisor_id);

    if (revisorIds.length === 0) {
      return res.status(400).json({ message: "No hay revisores previos para re-asignar." });
    }

    // Nueva ronda
    const maxRonda = await Evaluacion.max('ronda', { where: { articulo_id: id } });
    const nuevaRonda = (maxRonda || 0) + 1;

    const nuevasEvaluaciones = revisorIds.map(revisor_id => ({
      articulo_id: id,
      revisor_id,
      veredicto: null,
      observaciones_editor: null,
      observaciones_autor: null,
      fecha_evaluacion: null,
      ronda: nuevaRonda
    }));

    await Evaluacion.bulkCreate(nuevasEvaluaciones);

    // Cambiar estado a 'En_evaluacion'
    articulo.status = 'En_evaluacion';
    await articulo.save();

    return res.status(201).json({
      message: `Revisores re-asignados en ronda ${nuevaRonda}. El artículo pasó a estado 'En_evaluacion'.`,
      ronda: nuevaRonda
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al re-asignar revisores", error: error.message });
  }
};
