import express from 'express';
import {
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    crearUsuario,
    loginUsuario,
    crearUsuarioAdmin
} from '../controllers/usersControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginUsuario);
router.post('/registro', crearUsuario);

router.get('/todos', checkAuth, obtenerUsuarios);
router.post('/crear-admin', checkAuth, upload.single('cv'), crearUsuarioAdmin);

router.get('/', (req, res) => {
    res.json("activo");
});
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);

export default router;