import express from 'express';
import {
  incrementArticleView,
  incrementNumeroDownload,
  getRevistaStats
} from '../controllers/statsContentControllers.js';

const router = express.Router();

router.post('/articulos/:id/view', incrementArticleView);
router.post('/numeros/:numId/download', incrementNumeroDownload);
router.get('/revistas/:revId/stats', getRevistaStats);

export default router;
