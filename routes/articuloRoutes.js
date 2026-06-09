import express from 'express';
import { postArticle, postArchive, getArticleById, updateArticle, getArticulos, getArticulosAprobados, getArticulosPublicados, assignArticle, getRelatedArticles, getArticleBySlug, getMyManuscripts, getMyArticleEvaluations, rechazarArticulo, reUploadFiles, getArticleAdminDetail } from '../controllers/articuloControllers.js';
import upload from '../middlewares/uploadMiddleware.js';
import checkAuth from '../middlewares/authMiddleware.js';
import { checkRol } from '../middlewares/rolMiddleware.js';

const router = express.Router();

// Registrar un artículo nuevo (con su archivo principal)
router.post('/registrar', checkAuth, upload.fields([
    { name: 'manuscrito_original', maxCount: 1 },
    { name: 'manuscrito_anonimizado', maxCount: 1 },
    { name: 'ficha_autores', maxCount: 1 },
    { name: 'material_suplementario', maxCount: 1 },
    { name: 'img', maxCount: 1 }
]), postArticle);

// Agregar un archivo adicional a un artículo existente
router.post('/:id/archivos', checkAuth, upload.single('archivo'), postArchive);

// Rechazar artículo con formulario (editor)
router.post('/:id/rechazar', checkAuth, checkRol(['editor', 'administrador']), rechazarArticulo);

// Re-subir archivos (autor, cuando está por_corregir)
router.post('/:id/re-upload', checkAuth, upload.fields([
    { name: 'manuscrito_corregido', maxCount: 1 }
]), reUploadFiles);

// Obtener artículos aprobados
router.get('/aprobados', getArticulosAprobados);
router.get('/publicados', getArticulosPublicados);

// Mis manuscritos (investigador autenticado)
router.get('/mis-manuscritos', checkAuth, getMyManuscripts);

// Buscar artículo por slug (debe ir ANTES de /:id)
router.get('/slug/:slug', getArticleBySlug);

// Asignar artículo a número/revista
router.put('/:id/asignar', checkAuth, assignArticle);

// Artículos relacionados (misma línea)
router.get('/:id/relacionados', getRelatedArticles);

// Evaluaciones de un artículo propio (investigador)
router.get('/:id/mis-evaluaciones', checkAuth, getMyArticleEvaluations);

// Detalle completo para admin/editor (sin restricción de status)
router.get('/:id/admin', checkAuth, checkRol(['administrador', 'editor']), getArticleAdminDetail);

// Obtener un artículo y sus archivos (público)
router.get('/:id', getArticleById);

// Actualizar los datos de un artículo
router.put('/:id', checkAuth, upload.single('img'), updateArticle);

// Listar todos los artículos
router.get('/', checkAuth, getArticulos);

export default router;
