import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getEvaluaciones,
  getEvaluacionById,
  getEvaluacionesByArticulo,
  enviarVeredicto,
  eliminarEvaluacion
} from '../controllers/evaluacionControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';
import { checkRol } from '../middlewares/rolMiddleware.js';
import validarCampos from '../middlewares/validarCampos.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkAuth);

// GET /api/evaluaciones — listar todas (filtrable por revisor_id o articulo_id)
router.get('/',
  getEvaluaciones
);

// GET /api/evaluaciones/:id — obtener una evaluación por ID
router.get('/:id',
  param('id').isInt().withMessage('El ID debe ser un entero'),
  validarCampos,
  getEvaluacionById
);

// GET /api/evaluaciones/articulo/:id — evaluaciones de un artículo (editor/admin)
router.get('/articulo/:id',
  checkRol(['editor', 'administrador']),
  param('id').isInt().withMessage('El ID debe ser un entero'),
  validarCampos,
  getEvaluacionesByArticulo
);

// PUT /api/evaluaciones/:id/veredicto — jurado envía su veredicto
router.put('/:id/veredicto',
  checkRol(['revisor', 'administrador']),
  param('id').isInt().withMessage('El ID debe ser un entero'),
  body('veredicto')
    .isIn(['aprobado', 'corregir', 'rechazado'])
    .withMessage('El veredicto debe ser: aprobado, corregir o rechazado'),
  body('observaciones_editor').optional().isString(),
  body('observaciones_autor').optional().isString(),
  validarCampos,
  enviarVeredicto
);

// DELETE /api/evaluaciones/:id — eliminar evaluación pendiente (editor/admin)
router.delete('/:id',
  checkRol(['editor', 'administrador']),
  param('id').isInt().withMessage('El ID debe ser un entero'),
  validarCampos,
  eliminarEvaluacion
);

export default router;
