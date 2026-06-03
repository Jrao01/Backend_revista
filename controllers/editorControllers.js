import { 
    Articulo, 
    ArchivoArticulo, 
    Evaluacion, 
    Usuario 
} from '../models/index.js';

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
      url: req.file.path, 
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

    // Validar que todos los IDs correspondan a usuarios con rol 'jurado'
    for (const juradoId of juradosIds) {
      const usuario = await Usuario.findByPk(juradoId);
      if (!usuario || usuario.rol !== 'jurado') {
        return res.status(400).json({ message: `El usuario con ID ${juradoId} no existe o no tiene el rol de jurado.` });
      }
    }

    // Mapear los datos respetando las columnas y el ENUM del modelo Evaluacion.js
    const nuevasEvaluaciones = juradosIds.map(juradoId => ({
      articulo_id: id,
      revisor_id: juradoId,
      veredicto: null, // Se deja null porque el ENUM solo acepta ('aprobado', 'corregir', 'rechazado') y aún no evalúan
      observaciones_editor: null,
      observaciones_autor: null,
      fecha_evaluacion: null
    }));

    await Evaluacion.bulkCreate(nuevasEvaluaciones);

    // Cambiar opcionalmente el estado del artículo a 'En_evaluacion' si su flujo lo requiere
    articulo.status = 'En_evaluacion'; 
    await articulo.save();

    return res.status(201).json({ message: "Jurados ciegos asignados exitosamente. El artículo pasó a estado 'En_evaluacion'." });
  } catch (error) {
    return res.status(500).json({ message: "Error al asignar los jurados", error: error.message });
  }
};
