import express from 'express';
import { getProgramas, crearPrograma, actualizarPrograma } from '../controllers/programasControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getProgramas);
router.post('/', checkAuth, crearPrograma);
router.put('/:id', checkAuth, actualizarPrograma);

export default router;
