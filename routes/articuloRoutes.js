import express from 'express';
import { postArticle, postArchive, getArticleById, updateArticle, getArticulos } from '../controllers/articuloControllers.js';
import upload from '../middlewares/uploadMiddleware.js';
import checkAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

// Registrar un artículo nuevo (con su archivo principal)
// Los campos del formulario en el frontend para el registro del artículo
router.post('/registrar', checkAuth, upload.fields([
    { name: 'manuscrito_original', maxCount: 1 },
    { name: 'pagina_titulo', maxCount: 1 },
    { name: 'carta_originalidad', maxCount: 1 },
    { name: 'ficha_autores', maxCount: 1 },
    { name: 'material_suplementario', maxCount: 1 }
]), postArticle);

// Agregar un archivo adicional a un artículo existente
router.post('/:id/archivos', checkAuth, upload.single('archivo'), postArchive);

// Obtener un artículo y sus archivos
router.get('/:id', checkAuth, getArticleById);

// Actualizar los datos de un artículo
router.put('/:id', checkAuth, updateArticle);

// Listar todos los artículos
router.get('/', checkAuth, getArticulos);

export default router;
