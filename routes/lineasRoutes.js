import express from 'express';
import { getLineas, crearLinea, actualizarLinea } from '../controllers/lineasControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getLineas);
router.post('/', checkAuth, crearLinea);
router.put('/:id', checkAuth, actualizarLinea);

export default router;
