/*
@ 이미지 주소 만들기
- S3는 프라이빗 버킷이라 이미지는 항상 우리 API(GET /images/*key)를 거쳐서 보여준다.
- 프론트의 <Image>는 fetchClient를 거치지 않고 src를 그대로 요청하므로,
  Next rewrites 통로를 타도록 주소에 API_BASE(/api)를 붙여서 내려준다.
- 제공 방식이 바뀌면(CloudFront, presigned URL 등) 이 함수만 고친다.
*/
export function getImageUrl(imageKey: string): string {
  const apiBase = (process.env.API_BASE ?? '').replace(/\/+$/, '');

  return `${apiBase}/images/${imageKey}`;
}
