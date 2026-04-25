import express from 'express';
import { getAreas, crearArea, actualizarArea } from '../controllers/areasControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAreas);
router.post('/', checkAuth, crearArea);
router.put('/:id', checkAuth, actualizarArea);

export default router;
