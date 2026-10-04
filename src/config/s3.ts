import { S3Client } from '@aws-sdk/client-s3';

/*
@ S3 클라이언트
- 첫 요청 때 만든다. 모듈을 불러오는 시점에 만들면 AWS_REGION이 비어 있을 때
  S3Client가 "Region is missing"으로 던져서 서버가 시작조차 못 한다.
  AWS 설정이 없는 팀원도 서버는 켤 수 있어야 하므로 미룬다.
*/

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  // EC2에서는 IAM 역할을 쓰므로 키가 없으면 넘기지 않고 SDK 기본 방식에 맡긴다.
  client = new S3Client({
    region: process.env.AWS_REGION,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  return client;
}

export function getS3Bucket(): string {
  return process.env.AWS_S3_BUCKET_NAME ?? '';
}

// 요청 때 확인해서, 원인을 알 수 없는 S3 에러 대신 빠진 키를 알려준다.
export function findMissingS3Env(): string[] {
  return [
    ['AWS_REGION', process.env.AWS_REGION],
    ['AWS_S3_BUCKET_NAME', process.env.AWS_S3_BUCKET_NAME],
  ]
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key as string);
}
