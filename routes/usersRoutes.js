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

router.get('/', (req, res) => {
    res.json("activo");
});
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);

export default router;