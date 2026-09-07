import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import errorHandler from './middlewares/errorHandler';
import authRoutes from './routes/auth.route';
import { NotFoundError } from './types/errors';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// 라우터 등록은 여기 (도메인 라우터가 추가되면 이 위치에)
app.use(authRoutes);
// app.use(invitationsRoutes);
// app.use('/me', meRoutes);
// app.use('/admin', adminRoutes);
// app.use('/super-admin', superAdminRoutes);

// 매칭되는 라우트가 없는 요청
// 응답을 직접 만들지 않고 NotFoundError를 넘겨 errorHandler가 처리하게 한다.
// 응답 형식이 errorHandler 한 곳에서만 만들어지도록 통일하기 위함.
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('존재하지 않는 경로입니다.'));
});

// 전역 에러 핸들러 — 라우터·404 다음, 항상 마지막
app.use(errorHandler);

export default app;
