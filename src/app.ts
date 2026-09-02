import express, { NextFunction, Request, Response } from 'express';

import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

// 라우터 등록은 여기 (도메인 라우터가 추가되면 이 위치에)

// 매칭되는 라우트가 없는 요청
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '존재하지 않는 경로입니다.',
    code: 'NOT_FOUND',
  });
});

// 전역 에러 핸들러 — 라우터·404 다음, 항상 마지막
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
