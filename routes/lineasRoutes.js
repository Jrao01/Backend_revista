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
  [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
  getLineaById
);

router.post(
  '/',
  checkAuth,
  [
    body('programa_id')
      .notEmpty().withMessage('El programa_id es obligatorio')
      .isInt().withMessage('El programa_id debe ser numérico'),
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('status').optional().isBoolean().withMessage('El status debe ser booleano'),
    validarCampos
  ],
  createLinea
);

router.put(
  '/:id',
  checkAuth,
  [
    param('id').isInt().withMessage('El ID debe ser numérico'),
    body('programa_id').optional().isInt().withMessage('El programa_id debe ser numérico'),
    body('nombre').optional().isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('status').optional().isBoolean().withMessage('El status debe ser booleano'),
    validarCampos
  ],
  updateLinea
);

router.delete(
  '/:id',
  checkAuth,
  [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
  deleteLinea
);

export default router;
