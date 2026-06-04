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
  [
    param('id')
      .isInt()
      .withMessage('El ID debe ser numérico'),
    validarCampos
  ],
  getAreaById
);

router.post(
  '/',
  [
    body('programa_id')
      .notEmpty()
      .withMessage('El programa_id es obligatorio')
      .isInt()
      .withMessage('El programa_id debe ser numérico'),

    body('nombre')
      .notEmpty()
      .withMessage('El nombre es obligatorio')
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres'),

    body('color_institucional')
      .optional()
      .isString()
      .withMessage('El color institucional debe ser texto'),

    validarCampos
  ],
  createArea
);

router.put(
  '/:id',
  [
    param('id')
      .isInt()
      .withMessage('El ID debe ser numérico'),

    body('programa_id')
      .optional()
      .isInt()
      .withMessage('El programa_id debe ser numérico'),

    body('nombre')
      .optional()
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres'),

    body('color_institucional')
      .optional()
      .isString()
      .withMessage('El color institucional debe ser texto'),

    validarCampos
  ],
  updateArea
);

router.delete(
  '/:id',
  [
    param('id')
      .isInt()
      .withMessage('El ID debe ser numérico'),
    validarCampos
  ],
  deleteArea
);

export default router;
