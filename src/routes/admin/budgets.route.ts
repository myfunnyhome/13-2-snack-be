import { Router } from 'express';

import * as budgetController from '../../modules/budgets/budgets.controller';

const router = Router();

router.get('/summary', budgetController.getBudgetSummary);

export default router;
