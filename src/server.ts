// src/server.ts
import 'dotenv/config';

import app from './app';
import { startBudgetScheduler } from './schedulers/budget.scheduler';

const PORT = Number(process.env.PORT) || 3000;

startBudgetScheduler();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
