import { Router } from 'express';
import { DebtController } from '../controllers/debtController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const debtController = new DebtController();

router.use(requireAuth);

router.get('/', debtController.index);
router.get('/create', debtController.showCreateForm);
router.post('/', debtController.create);
router.get('/:id/edit', debtController.showEditForm);
router.post('/:id', debtController.update);
router.post('/:id/delete', debtController.delete);

export default router;
