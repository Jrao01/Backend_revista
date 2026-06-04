import { Router } from 'express';
import { 
    realizarDeskReview, 
    subirManuscritoAnonimo, 
    asignarJurados 
} from '../controllers/editorControllers.js';
import upload from '../middlewares/uploadMiddleware.js';
import checkAuth from '../middlewares/authMiddleware.js'; 
import { checkRol } from '../middlewares/rolMiddleware.js'; 

const router = Router();

// Seguridad Global: Solo editores o administradores autenticados operan estas rutas
router.use(checkAuth, checkRol(['editor', 'administrador']));

// Endpoints
router.put('/:id/desk-review', realizarDeskReview);
router.put('/:id/anonimizar', upload.single('manuscrito_anonimo'), subirManuscritoAnonimo);
router.post('/:id/asignar-jurados', asignarJurados);

export default router;
