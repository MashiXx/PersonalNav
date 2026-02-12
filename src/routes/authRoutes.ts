import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { redirectIfAuth } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.get('/login', redirectIfAuth, authController.showLoginPage);
router.get('/register', redirectIfAuth, authController.showRegisterPage);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

export default router;
