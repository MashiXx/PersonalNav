import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

router.use(requireAuth);

router.get('/', dashboardController.index);
router.get('/reports', dashboardController.reports);
router.post('/snapshot', dashboardController.createSnapshot);

export default router;
