import express from 'express';
import { getRevistas, crearRevista, actualizarRevista } from '../controllers/revistaControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getRevistas);
router.post('/', checkAuth, crearRevista);
router.put('/:id', checkAuth, actualizarRevista);

export default router;
