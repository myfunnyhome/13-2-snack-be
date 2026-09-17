import { Router } from 'express';

import * as invitationController from '../../modules/invitation/invitation.controller';

const router = Router();

router.post('/', invitationController.create);

export default router;
