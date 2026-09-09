import { Router } from 'express';

import * as invitationController from '../modules/invitation/invitation.controller';

const router = Router();

router.get('/invitations/:id', invitationController.getById);

export default router;
