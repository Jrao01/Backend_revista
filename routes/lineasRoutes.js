import express from 'express';
import { body, param } from 'express-validator';
import validarCampos from '../middlewares/validarCampos.js';
import checkAuth from '../middlewares/authMiddleware.js';

import {
  createLinea,
  listLineas,
  getLineaById,
  updateLinea,
  deleteLinea
} from '../controllers/lineaInvestigacionController.js';

const router = express.Router();

router.get('/', listLineas);

router.get(
  '/:id',
  [
    param('id')
      .isInt()
      .withMessage('El ID debe ser numérico'),
    validarCampos
  ],
  getLineaById
);

router.post(
  '/',
  checkAuth,
  [
    body('area_id')
      .notEmpty()
      .withMessage('El area_id es obligatorio')
      .isInt()
      .withMessage('El area_id debe ser numérico'),

    body('nombre')
      .notEmpty()
      .withMessage('El nombre es obligatorio')
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres'),

    body('tipo')
      .notEmpty()
      .withMessage('El tipo es obligatorio')
      .isIn(['Matriz', 'Asociada'])
      .withMessage('El tipo debe ser Matriz o Asociada'),

    validarCampos
  ],
  createLinea
);

router.put(
  '/:id',
  checkAuth,
  [
    param('id')
      .isInt()
      .withMessage('El ID debe ser numérico'),

    body('area_id')
      .optional()
      .isInt()
      .withMessage('El area_id debe ser numérico'),

    body('nombre')
      .optional()
      .isLength({ min: 3 })
      .withMessage('El nombre debe tener al menos 3 caracteres'),

    body('tipo')
      .optional()
      .isIn(['Matriz', 'Asociada'])
      .withMessage('El tipo debe ser Matriz o Asociada'),

    validarCampos
  ],
  updateLinea
);

router.delete(
  '/:id',
  checkAuth,
  [
    param('id')
      .isInt()
      .withMessage('El ID debe ser numérico'),
    validarCampos
  ],
  deleteLinea
);

export default router;
