import express from 'express';
import { body, param } from 'express-validator';
import validarCampos from '../middlewares/validarCampos.js';

import {
  createArea,
  listAreas,
  getAreaById,
  updateArea,
  deleteArea
} from '../controllers/areasControllers.js';

const router = express.Router();

router.get('/', listAreas);

router.get(
  '/:id',
  [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
  getAreaById
);

router.post(
  '/',
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('color_institucional').optional().isString(),
    body('status').optional().isBoolean().withMessage('El status debe ser booleano'),
    validarCampos
  ],
  createArea
);

router.put(
  '/:id',
  [
    param('id').isInt().withMessage('El ID debe ser numérico'),
    body('nombre').optional().isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('color_institucional').optional().isString(),
    body('status').optional().isBoolean().withMessage('El status debe ser booleano'),
    validarCampos
  ],
  updateArea
);

router.delete(
  '/:id',
  [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
  deleteArea
);

export default router;
