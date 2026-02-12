import { Router } from 'express';
import { AssetController } from '../controllers/assetController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const assetController = new AssetController();

router.use(requireAuth);

router.get('/', assetController.index.bind(assetController));
router.get('/create', assetController.showCreateForm.bind(assetController));
router.post('/', assetController.create.bind(assetController));
router.post('/refresh-all-prices', assetController.refreshAllPrices.bind(assetController));
router.get('/:id/edit', assetController.showEditForm.bind(assetController));
router.post('/:id', assetController.update.bind(assetController));
router.post('/:id/delete', assetController.delete.bind(assetController));
router.get('/:id/history', assetController.showPriceHistory.bind(assetController));
router.post('/:id/refresh-price', assetController.refreshPrice.bind(assetController));

export default router;
