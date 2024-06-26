import { Router } from 'express';
import authControllers from './auth.controllers';

const router = Router();

router.post('/sign-in', authControllers.loginUser);
router.post('/sign-up', authControllers.registerUser);
router.post('/logout', authControllers.logoutUser);
router.patch('/refresh', authControllers.refreshToken);
router.post('/forgot', authControllers.forgotPassword);
router.patch('/reset-password', authControllers.resetPassword);
router.get('/user', authControllers.authenticateToken, authControllers.getUser);

export default router;
