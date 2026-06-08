import express from 'express';
import { body, param } from 'express-validator';
import {
    getProgramas,
    getProgramaById,
    crearPrograma,
    actualizarPrograma,
    eliminarPrograma
} from '../controllers/programasControllers.js';

import checkAuth from '../middlewares/authMiddleware.js';
import validarCampos from '../middlewares/validarCampos.js';

const router = express.Router();

router.get('/', getProgramas);

router.get(
    '/:id',
    [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
    getProgramaById
);

router.post(
    '/',
    checkAuth,
    [
        body('area_id')
            .notEmpty().withMessage('El area_id es obligatorio')
            .isInt().withMessage('El area_id debe ser numérico'),
        body('nombre')
            .notEmpty().withMessage('El nombre es obligatorio')
            .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
        body('status').optional().isBoolean().withMessage('El status debe ser booleano'),
        validarCampos
    ],
    crearPrograma
);

router.put(
    '/:id',
    checkAuth,
    [
        param('id').isInt().withMessage('El ID debe ser numérico'),
        body('area_id').optional().isInt().withMessage('El area_id debe ser numérico'),
        body('nombre').optional().isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
        body('status').optional().isBoolean().withMessage('El status debe ser booleano'),
        validarCampos
    ],
    actualizarPrograma
);

router.delete(
    '/:id',
    checkAuth,
    [param('id').isInt().withMessage('El ID debe ser numérico'), validarCampos],
    eliminarPrograma
);

export default router;
