import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../services/uploadService';

const router = Router();
const profileController = new ProfileController();

router.use(requireAuth);

router.get('/', profileController.showProfile);
router.post('/update', profileController.updateProfile);
router.post('/avatar/upload', upload.single('avatar'), profileController.uploadAvatar);
router.post('/avatar/default', profileController.setDefaultAvatar);

export default router;
