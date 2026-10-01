import { Router } from 'express';

import * as budgetController from '../../modules/budgets/budgets.controller';

const router = Router();

router.get('/setting', budgetController.getBudget);
router.patch('/setting', budgetController.patchBudget);

export default router;
