import { Router } from 'express';

import profileRoutes from './profile.route';
import userRoutes from './user.route';

const router = Router();

router.use('/', userRoutes);
router.use('/profile', profileRoutes);

export default router;
