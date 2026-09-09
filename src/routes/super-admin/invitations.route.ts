import { Router } from 'express';

import { authenticate, authorize } from '../../middlewares/auth.middleware';
import * as invitationController from '../../modules/invitation/invitation.controller';

const router = Router();

router.post(
  '/invitations',
  authenticate,
  authorize('SUPER_ADMIN'),
  invitationController.create,
);

export default router;
