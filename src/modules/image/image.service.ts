import { Readable } from 'node:stream';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  S3ServiceException,
} from '@aws-sdk/client-s3';

import { findMissingS3Env, getS3Bucket, getS3Client } from '../../config/s3';
import { NotFoundError } from '../../types/errors';

type ImageObject = {
  body: Readable;
  contentType: string;
  contentLength?: number;
};

function assertS3Env(): void {
  const missingEnv = findMissingS3Env();

  if (missingEnv.length > 0) {
    throw new Error(`이미지 설정이 없습니다. .env에 ${missingEnv.join(', ')}`);
  }
}

/*
없는 이미지를 요청했을 때 S3가 주는 응답이 IAM 권한에 따라 다르다.
- s3:ListBucket이 있으면 404 NoSuchKey
- 없으면 403 AccessDenied (파일이 있는지조차 알려주지 않는다)
둘 다 "이미지가 없다"로 보고 404로 맞춘다. 다만 403은 버킷명·리전·권한이
잘못됐을 때도 나오므로, 설정 문제를 놓치지 않게 서버 로그는 남긴다.
*/
function isImageNotFound(error: unknown): boolean {
  if (error instanceof NoSuchKey) return true;

  if (
    error instanceof S3ServiceException &&
    error.$metadata.httpStatusCode === 403
  ) {
    console.error('S3 AccessDenied (버킷·리전·IAM 권한 확인 필요):', error);
    return true;
  }

  return false;
}

export async function getImageObject(imageKey: string): Promise<ImageObject> {
  assertS3Env();

  try {
    const result = await getS3Client().send(
      new GetObjectCommand({ Bucket: getS3Bucket(), Key: imageKey }),
    );

    if (!(result.Body instanceof Readable)) {
      throw new Error('S3 응답에서 이미지 스트림을 받지 못했습니다.');
    }

    return {
      body: result.Body,
      contentType: result.ContentType ?? 'application/octet-stream',
      contentLength: result.ContentLength,
    };
  } catch (error) {
    if (isImageNotFound(error)) {
      throw new NotFoundError('이미지를 찾을 수 없습니다.');
    }

    throw error;
  }
}

// S3의 DeleteObject는 없는 key여도 성공으로 응답한다.
export async function deleteImageObject(imageKey: string): Promise<void> {
  assertS3Env();

  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: getS3Bucket(), Key: imageKey }),
  );
}
