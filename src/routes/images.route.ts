import { Router } from 'express';

import { Role } from '../generated/prisma/client';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadImageToS3 } from '../middlewares/upload.middleware';
import * as imageController from '../modules/image/image.controller';

const router = Router();

// 상품 등록이 일반 회원에게도 열려 있어 업로드·조회는 로그인만 확인한다.
router.post('/', authenticate, uploadImageToS3, imageController.createImage);
router.get('/*key', authenticate, imageController.getImage);
// TODO: imageKey가 DB에 추가되면 상품 등록자 본인도 삭제할 수 있게 하고 DB 기록도 정리한다.
router.delete(
  '/*key',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  imageController.deleteImage,
);

export default router;
