import { Request, Response } from 'express';

import { snackyQuestionBodySchema } from './snacky.schema';
import * as snackyService from './snacky.service';

export async function askSnacky(req: Request, res: Response): Promise<void> {
  const { question } = snackyQuestionBodySchema.parse(req.body);
  const result = await snackyService.answerQuestion(question);
  res.status(200).json({ success: true, data: result });
}
