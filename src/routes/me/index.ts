import { Router } from 'express';

import profileRoutes from './profile.route';
import userRoutes from './user.route';

const router = Router();

router.use(userRoutes);
router.use(profileRoutes);

export default router;
