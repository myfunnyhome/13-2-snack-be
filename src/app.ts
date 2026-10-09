import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from './config/swagger';
import errorHandler from './middlewares/errorHandler';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth.route';
import imagesRoutes from './routes/images.route';
import invitationsRoutes from './routes/invitations.route';
import meRoutes from './routes/me';
import ordersRoutes from './routes/orders.route';
import productsRoutes from './routes/products.route';
import superAdminRoutes from './routes/super-admin';
import { NotFoundError } from './types/errors';

// CORS, 메일 링크, Turnstile hostname 검증이 모두 이 값을 쓴다.
if (!process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL 환경변수가 필요합니다.');
}

const app = express();

// Nginx 한 단계만 신뢰해 req.ip를 정한다.
app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// 라우터 등록은 여기 (도메인 라우터가 추가되면 이 위치에)
app.use('/auth', authRoutes);
app.use('/invitations', invitationsRoutes);
app.use('/orders', ordersRoutes);
app.use('/images', imagesRoutes);
app.use('/products', productsRoutes);
app.use('/me', meRoutes);
app.use('/admin', adminRoutes);
app.use('/super-admin', superAdminRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 매칭되는 라우트가 없는 요청
// 응답을 직접 만들지 않고 NotFoundError를 넘겨 errorHandler가 처리하게 한다.
// 응답 형식이 errorHandler 한 곳에서만 만들어지도록 통일하기 위함.
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('존재하지 않는 경로입니다.'));
});

// 전역 에러 핸들러 — 라우터·404 다음, 항상 마지막
app.use(errorHandler);

export default app;
