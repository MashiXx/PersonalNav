import { Router } from 'express';
import { AssetController } from '../controllers/assetController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const assetController = new AssetController();

router.use(requireAuth);

router.get('/', assetController.index);
router.get('/create', assetController.showCreateForm);
router.post('/', assetController.create);
router.get('/:id/edit', assetController.showEditForm);
router.post('/:id', assetController.update);
router.post('/:id/delete', assetController.delete);
router.get('/:id/history', assetController.showPriceHistory);

export default router;
