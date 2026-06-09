import express from 'express';
import { body, param } from 'express-validator';
import validarCampos from '../middlewares/validarCampos.js';
import checkAuth from '../middlewares/authMiddleware.js';

import {
    getRevistas,
    getRevistaById,
    getAllRevistasAdmin,
    crearRevista,
    actualizarRevista,
    desactivarRevista,
    activarRevista
} from '../controllers/revistaControllers.js';
import {
    listVolumenes,
    getVolumenById,
    createVolumen,
    updateVolumen,
    deleteVolumen
} from '../controllers/volumenControllers.js';
import {
    listNumeros,
    getNumeroById,
    createNumero,
    updateNumero,
    deleteNumero
} from '../controllers/numeroRevistaController.js';
import { asignarArticuloANumero } from '../controllers/articuloControllers.js';

const router = express.Router();

const revIdParam = param('revId').isInt().withMessage('revId debe ser numérico');
const volIdParam = param('volId').isInt().withMessage('volId debe ser numérico');
const numIdParam = param('numId').isInt().withMessage('numId debe ser numérico');

router.get('/', getRevistas);
router.get('/admin/all', checkAuth, getAllRevistasAdmin);
router.get('/:id', [param('id').isInt().withMessage('id debe ser numérico'), validarCampos], getRevistaById);
router.post('/', checkAuth, crearRevista);
router.put('/:id', checkAuth, actualizarRevista);
router.patch('/:id/desactivar', checkAuth, desactivarRevista);
router.patch('/:id/activar', checkAuth, activarRevista);

// --- Volúmenes (Mark) ---
router.get('/:revId/volumenes', [revIdParam, validarCampos], listVolumenes);
router.post(
    '/:revId/volumenes',
    checkAuth,
    [
        revIdParam,
        body('numero_volumen').isInt({ min: 1 }).withMessage('numero_volumen debe ser un entero positivo'),
        validarCampos
    ],
    createVolumen
);
router.get('/:revId/volumenes/:volId', [revIdParam, volIdParam, validarCampos], getVolumenById);
router.put(
    '/:revId/volumenes/:volId',
    checkAuth,
    [
        revIdParam,
        volIdParam,
        body('numero_volumen').optional().isInt({ min: 1 }),
        validarCampos
    ],
    updateVolumen
);
router.delete(
    '/:revId/volumenes/:volId',
    checkAuth,
    [revIdParam, volIdParam, validarCampos],
    deleteVolumen
);

// --- Números anidados bajo volumen (Mark) ---
router.get(
    '/:revId/volumenes/:volId/numeros',
    [revIdParam, volIdParam, validarCampos],
    listNumeros
);
router.post(
    '/:revId/volumenes/:volId/numeros',
    checkAuth,
    [
        revIdParam,
        volIdParam,
        body('numero').isInt({ min: 1 }).withMessage('numero debe ser un entero positivo'),
        body('anio').optional().isInt(),
        body('titulo_edicion').optional().isString(),
        body('status').optional().isIn(['futuro', 'publicado']),
        validarCampos
    ],
    createNumero
);
router.get(
    '/:revId/volumenes/:volId/numeros/:numId',
    [revIdParam, volIdParam, numIdParam, validarCampos],
    getNumeroById
);
router.put(
    '/:revId/volumenes/:volId/numeros/:numId',
    checkAuth,
    [revIdParam, volIdParam, numIdParam, validarCampos],
    updateNumero
);
router.delete(
    '/:revId/volumenes/:volId/numeros/:numId',
    checkAuth,
    [revIdParam, volIdParam, numIdParam, validarCampos],
    deleteNumero
);

// --- Rutas viejas (deprecadas): evitar crear sin validación ---
const rutaObsoletaNumeros = (req, res) => {
    res.status(410).json({
        message: 'Ruta obsoleta. Primero crea el volumen, luego el número.',
        pasos: [
            'POST /api/revistas/:revId/volumenes  body: { "numero_volumen": 12 }',
            'POST /api/revistas/:revId/volumenes/:volId/numeros  body: { "numero": 1, "anio": 2026, ... }'
        ]
    });
};
router.get('/:revId/numeros', rutaObsoletaNumeros);
router.post('/:revId/numeros', checkAuth, rutaObsoletaNumeros);

// --- Asignación de artículos (Dixon) ---
router.post(
    '/:revId/volumenes/:volId/numeros/:numId/articulos',
    checkAuth,
    [
        revIdParam,
        volIdParam,
        numIdParam,
        body('articulo_id').isInt().withMessage('articulo_id debe ser numérico'),
        validarCampos
    ],
    asignarArticuloANumero
);

export default router;
