import {
    getRevistas,
    crearRevista,
    actualizarRevista,
    desactivarRevista
} from '../controllers/revistaControllers.js';
import {
    getNumerosPorRevista,
    crearNumero
} from '../controllers/numeroRevistaController.js';
import { asignarArticuloANumero } from '../controllers/articuloControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';
import { body, param } from 'express-validator';
import validarCampos from '../middlewares/validarCampos.js';
import express from 'express';

const router = express.Router();

router.get('/', getRevistas);
router.post('/', checkAuth, crearRevista);
router.put('/:id', checkAuth, actualizarRevista);
router.patch('/:id/desactivar', checkAuth, desactivarRevista);

// Números de revista
router.get('/:revistaId/numeros', getNumerosPorRevista);
router.post('/:revistaId/numeros', checkAuth, crearNumero);

// Asignar artículo aprobado a un número (volumen + número)
router.post(
    '/:revId/volumenes/:volId/numeros/:numId/articulos',
    checkAuth,
    [
        param('revId').isInt().withMessage('revId debe ser numérico'),
        param('volId').isInt().withMessage('volId debe ser numérico'),
        param('numId').isInt().withMessage('numId debe ser numérico'),
        body('articulo_id').isInt().withMessage('articulo_id debe ser numérico'),
        validarCampos
    ],
    asignarArticuloANumero
);

export default router;