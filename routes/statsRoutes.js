import { Router } from 'express';
import { getDashboardStats } from "../controllers/statsControllers.js";
import checkAuth from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/dashboard', checkAuth, getDashboardStats);

export default router;
