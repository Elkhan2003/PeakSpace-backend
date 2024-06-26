import { Router } from 'express';
import uploadControllers from './upload.controllers';
import { upload } from '../../plugins/multer';

const router = Router();

router.post('/avatar', upload.single('avatar'), uploadControllers.uploadPhoto);

export default router;
