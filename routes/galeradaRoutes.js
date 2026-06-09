import express from 'express';
import {
  publicarArticulo,
  verGaleradaHTML,
  descargarGaleradaPDF,
  descargarNumeroPDF,
  publicarNumero,
  verJATS,
  verHTML5
} from '../controllers/galeradaControllers.js';
import checkAuth from '../middlewares/authMiddleware.js';
import { checkRol } from '../middlewares/rolMiddleware.js';

const router = express.Router();

// Ver galerada HTML de un artículo (público, solo artículos publicados)
router.get('/articulos/:id/galerada', verGaleradaHTML);

// Descargar galerada PDF de un artículo (público, solo artículos publicados)
router.get('/articulos/:id/download-galerada', descargarGaleradaPDF);

// Ver JATS XML de un artículo (público)
router.get('/articulos/:id/jats', verJATS);

// Ver HTML5 semántico de un artículo (público)
router.get('/articulos/:id/html5', verHTML5);

// Publicar un artículo (editor o admin)
router.post('/articulos/:id/publicar', checkAuth, checkRol(['editor', 'administrador']), publicarArticulo);

// Descargar PDF completo de un número de revista (público)
router.get('/numeros/:id/download-pdf', descargarNumeroPDF);

// Publicar un número completo (editor o admin)
router.post('/numeros/:id/publicar', checkAuth, checkRol(['editor', 'administrador']), publicarNumero);

export default router;
