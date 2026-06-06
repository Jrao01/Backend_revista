import express from 'express';
import { listAllVolumenes } from '../controllers/volumenControllers.js';

const router = express.Router();

router.get('/', listAllVolumenes);

export default router;
