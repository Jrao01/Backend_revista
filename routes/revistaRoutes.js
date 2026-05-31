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
import checkAuth from '../middlewares/authMiddleware.js';
import express from 'express';

const router = express.Router();

router.get('/', getRevistas);
router.post('/', checkAuth, crearRevista);
router.put('/:id', checkAuth, actualizarRevista);
router.patch('/:id/desactivar', checkAuth, desactivarRevista);

// Números de revista
router.get('/:revistaId/numeros', getNumerosPorRevista);
router.post('/:revistaId/numeros', checkAuth, crearNumero);

export default router;