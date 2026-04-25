import express from 'express';
import {
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    crearUsuario,
    loginUsuario
} from '../controllers/usersControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginUsuario);
router.post('/registro', crearUsuario);

// Rutas protegidas (requieren token)
router.get('/', checkAuth, obtenerUsuarios);
router.get('/:id', checkAuth, obtenerUsuario);
router.put('/:id', checkAuth, actualizarUsuario);

export default router;
