import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';

import { findMissingS3Env, getS3Bucket, getS3Client } from '../config/s3';
import { PRODUCT_IMAGE_KEY_PREFIX } from '../modules/image/image.constants';
import { BadRequestError } from '../types/errors';

/*
@ 이미지 업로드 미들웨어 (multer + multer-s3)
- multipart/form-data로 온 파일을 받아 프라이빗 S3에 올리고 req.file에 결과를 담는다.
  express.json()은 JSON만 읽으므로 파일은 이 미들웨어가 있어야 받는다.
- 제한: 필드명 image, 한 번에 한 장, 5MB, jpg·png·webp·gif
- MulterError는 errorHandler가 모르는 에러라 500이 되므로 여기서 400으로 바꾼다.
*/

const FIELD_NAME = 'image';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 원본 파일명의 한글·공백·중복을 피해 UUID로 새로 만들고 확장자만 mime에서 정한다.
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// S3 클라이언트와 마찬가지로 첫 요청 때 만든다. (config/s3.ts 주석 참고)
let uploadSingle: RequestHandler | null = null;

function getUploadSingle(): RequestHandler {
  if (uploadSingle) return uploadSingle;

  uploadSingle = multer({
    storage: multerS3({
      s3: getS3Client(),
      bucket: getS3Bucket(),
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(_req, file, callback) {
        const extension = EXTENSION_BY_MIME_TYPE[file.mimetype] ?? '';

        callback(
          null,
          `${PRODUCT_IMAGE_KEY_PREFIX}${randomUUID()}${extension}`,
        );
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter(_req, file: Express.Multer.File, callback: FileFilterCallback) {
      if (!(file.mimetype in EXTENSION_BY_MIME_TYPE)) {
        callback(
          new BadRequestError('jpg, png, webp, gif 이미지만 올릴 수 있습니다.'),
        );
        return;
      }

      callback(null, true);
    },
  }).single(FIELD_NAME);

  return uploadSingle;
}

export function uploadImageToS3(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // API_BASE는 업로드 응답의 imageUrl을 만들 때 필요하다.
  const missingEnv = [
    ...findMissingS3Env(),
    ...(process.env.API_BASE?.trim() ? [] : ['API_BASE']),
  ];

  if (missingEnv.length > 0) {
    next(new Error(`이미지 설정이 없습니다. .env에 ${missingEnv.join(', ')}`));
    return;
  }

  getUploadSingle()(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(new BadRequestError('이미지는 5MB 이하만 올릴 수 있습니다.'));
        return;
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        next(new BadRequestError('이미지는 한 번에 한 장만 올릴 수 있습니다.'));
        return;
      }

      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        next(new BadRequestError(`이미지는 ${FIELD_NAME} 필드로 보내주세요.`));
        return;
      }

      next(new BadRequestError('이미지 업로드에 실패했습니다.'));
      return;
    }

    // 파일 형식 거부(BadRequestError)와 S3 통신 실패는 그대로 errorHandler로 넘긴다.
    next(error);
  });
}
