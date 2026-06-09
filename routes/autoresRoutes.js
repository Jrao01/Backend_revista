import express from 'express';
import { param } from 'express-validator';
import validarCampos from '../middlewares/validarCampos.js';
import { getAutorProfile, getAllAutores } from '../controllers/autoresControllers.js';

const router = express.Router();

router.get('/', getAllAutores);

router.get(
  '/:id',
  [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
  getAutorProfile
);

export default router;
