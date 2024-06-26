import { Router } from 'express';
import cors from 'cors';
import authRoutes from '../modules/auth/auth.routes';
import chatsRoutes from '../modules/chats/chats.routes';
import uploadRoutes from '../modules/upload/upload.routes';

const router = Router();

router.get('/', cors(), (req, res) => {
	res.status(200).send({
		status: true
	});
});
router.use('/auth', cors(), authRoutes);
router.use('/chats', cors(), chatsRoutes);
router.use('/upload', cors(), uploadRoutes);

export default router;
