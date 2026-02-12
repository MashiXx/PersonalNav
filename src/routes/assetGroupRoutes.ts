import { Router } from 'express';
import { AssetGroupController } from '../controllers/assetGroupController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const assetGroupController = new AssetGroupController();

router.use(requireAuth);

router.get('/', assetGroupController.index);
router.get('/create', assetGroupController.showCreateForm);
router.post('/', assetGroupController.create);
router.get('/:id', assetGroupController.show);
router.get('/:id/edit', assetGroupController.showEditForm);
router.post('/:id', assetGroupController.update);
router.post('/:id/delete', assetGroupController.delete);

export default router;
