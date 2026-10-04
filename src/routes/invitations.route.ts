import { Router } from 'express';

import * as invitationController from '../modules/invitation/invitation.controller';

const router = Router();

router.get('/:token', invitationController.getByToken);

export default router;
