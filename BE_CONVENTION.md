// BE_CONVENTION.md

# SNACK BE Convention

이 문서는 AI가 SNACK 백엔드 작업 시 따라야 하는 규칙이다. 작업 전 현재 코드와 설정을 확인하고, 요청받지 않은 파일은 수정하지 않는다.

## AI 작업 범위

- 설명, 검토, 진단 요청에서는 파일을 수정하지 않고 결과만 보고한다.
- 코드 변경 전 대상 파일, 변경 내용, 영향 범위를 설명하고 사용자 승인을 받는다.
- 승인받은 범위를 벗어난 리팩터링, 패키지 설치, 설정 변경은 임의로 진행하지 않는다.
- 기존 코드와 사용자가 작성한 변경사항을 임의로 삭제하거나 되돌리지 않는다.
- 파일 삭제·이동, 패키지 설치, DB 변경 및 데이터 변경은 별도로 사용자 확인을 받는다.
- 변경 후 수정한 파일과 검사 결과를 보고하며, 실패한 검사를 숨기지 않는다.
- 비밀값과 개인정보를 코드, 로그, 응답에 노출하지 않는다.

## Git 규칙

- 사용자 요청 없이 브랜치 생성·변경, 커밋, Push, PR 생성 및 Merge를 실행하지 않는다.
- Git 작업이 필요하면 실행할 작업과 영향을 먼저 설명하고 사용자 확인을 받는다.

## 브랜치 규칙

- `main`은 프로덕션 브랜치로 사용한다.
- `dev`는 개발 브랜치로 사용한다.
- 기능 개발은 `feat/*` 브랜치에서 진행한다.
- 브랜치 이름은 이슈 이름과 동일하게 작성한다.
- 브랜치 이름은 영어로 작성한다.
- 브랜치 이름은 `{태그}/{카테고리}-{기능}-{권한}` 형식을 따른다.
- 태그는 `feat`, `fix`, `chore`, `refactor`, `docs`를 사용한다.
- 카테고리는 도메인 기준으로 작성한다.
- 권한은 `general`, `admin`, `superadmin`을 사용한다.
- PR 전 작업 브랜치에 최신 `origin/dev`를 rebase한다.
- PR 생성 시 페어 팀원을 assign한다.
- Merge는 팀장 또는 부팀장이 `Squash and Merge`로 진행한다.

## 커밋 컨벤션

- `docs`: README, Wiki 등 문서 수정
- `feat`: 새로운 기능 추가
- `fix`: 버그, 오류 수정
- `refactor`: 기능 변경 없는 유지보수 작업
- `chore`: 빌드, 패키지 관리, 주석 추가 및 수정 등 기타 작업

## 네이밍 컨벤션

- 일반 변수는 `camelCase`를 사용한다.
- 함수명은 `camelCase`를 사용한다.
- 상수는 `UPPER_SNAKE_CASE`를 사용한다.
- Boolean 변수는 `is`, `has`, `can` 접두사를 사용한다.
- 의미 없는 이름은 사용하지 않는다.

## 레이어 아키텍처 네이밍 & Import 컨벤션

- 도메인별로 `src/modules/<domain>` 폴더를 만들고, 그 안에서 controller, service, repository, schema를 분리한다.
- route는 `src/routes`에서 endpoint와 middleware 연결을 담당한다.
- repository는 엔티티 또는 도메인 단위로 작성하되, 현재 모듈의 책임을 벗어나지 않는다.
- repository 함수명은 엔티티명을 반복하지 않고 짧게 작성한다.
- service 함수명은 동작 중심으로 작성한다.
- 계층 간 호출은 네임스페이스 import를 사용한다.
- utils 함수는 개별 named import를 사용한다.

```ts
import * as userRepository from '../repositories/user.repository';
import * as authService from '../services/auth.service';

userRepository.findById(id);
authService.signin(email, password);
```

```ts
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken } from '../utils/token';

hashPassword(password);
signAccessToken(payload);
```

## 코딩 컨벤션

- Husky는 pre-commit 정도만 적용한다.
- 규칙을 지키기 어려운 특수 상황에서는 `chore`를 사용한다.
- Prettier 포맷 규칙을 따른다.
- `singleQuote`, `trailingComma: all`, `printWidth: 80`을 따른다.
- import 순서는 프로젝트 설정을 따른다.

## 주석 작성 규칙

- 다른 팀원들과 공유가 필요한 코드는 주석으로 명시한다.

```css
/*=================================================
    주석 제목
=================================================*/

/*
@ 제목
- 설명
*/
```

## API 응답 형식

- 모든 API 응답은 `success` 필드로 성공과 실패를 구분한다.
- 성공 응답은 `{ success: true, data }` 형식을 사용한다.
- 실패 응답은 `{ success: false, message, code }` 형식을 사용한다.
- 데이터가 없는 경우 `data`는 생략하거나 `null`로 처리할 수 있다.
- `message`는 에러 내용을 나타낸다.
- `code`는 에러 종류 식별자로 사용한다.

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": false,
  "message": "에러 메시지",
  "code": "ERROR_CODE"
}
```

## Swagger 컨벤션

- Tag 명은 단수형으로 작성한다.
- Swagger 분류는 기능별로 나눈다.
- 각 Tag에는 설명을 작성한다.
- 각 endpoint에는 Description을 작성한다.
- Swagger 문서와 실제 동작이 일치하는지 확인한다.
- 쿼리, 경로, 바디 파라미터가 실제 요청과 일치하는지 확인한다.
- 응답 본문이 실제 service 로직과 맞는지 확인한다.
- route 경로가 Swagger 문서와 일치하는지 확인한다.
- 인증이 필요한 API는 Swagger UI에서 자물쇠 아이콘이 보이도록 설정한다.
- Swagger 설정에 Bearer Token 인가 방식을 추가한다.

## Prisma 컨벤션

- 물리적 Schema 작성 방식은 기본 학습 방식으로 적용한다.
- Prisma 필드는 `camelCase`를 사용한다.
- Prisma 모델명은 `PascalCase`와 단수형을 사용한다.
- Prisma schema와 실제 repository 코드의 필드 사용이 일치하는지 확인한다.
- 생성물(`src/generated`)은 직접 수정하지 않는다.

## API 명세서 컨벤션

- 경로 매개변수는 `:id`로 통일한다.
- 뎁스가 늘어나면 필요한 곳에 `orderId`처럼 id를 명시한다.
- 로그인 사용자 기준 API는 `/me` 프리픽스를 사용한다.
- 관리자 기준 API는 `/admin` 프리픽스를 사용한다.
- 최고 관리자 기준 API는 `/super-admin/{domain}` 형식을 사용한다.
- 권한 검사는 프론트와 백엔드 모두에서 수행한다.
- 수정이 필요한 부분이 보이면 작업한 사람에게 수정 요청한다.

## TypeScript 타입 선언

- 사용자 정의 타입은 기본적으로 `type` alias를 사용한다.
- `interface`는 Express `Request` 확장처럼 선언 병합이 필요한 경우 또는 `class`의 구조를 정의할 때 사용한다.
- Prisma 등 라이브러리가 제공하는 타입은 중복 정의하지 않고 import하여 사용한다.
- `any` 사용을 지양한다.
- 외부 입력값은 `unknown`으로 받은 뒤 타입 가드 또는 스키마 검증으로 타입을 좁힌다.
- 함수의 매개변수 타입은 반드시 명시한다.
- 반환 타입은 TypeScript가 추론할 수 있으나, 가급적 명시하는 것을 권장한다.
- 비동기 함수의 반환 타입은 명시할 경우 `Promise<T>` 형태로 작성한다.
- 반환값이 없는 함수의 반환 타입은 `void` 또는 `Promise<void>`로 작성한다.
- Controller, Service, Repository의 공개 함수는 반환 타입을 명시하는 것을 권장한다.
- Controller의 비동기 함수는 일반적으로 `Promise<void>`를 사용한다.
- Prisma 조회·생성 함수는 Prisma가 제공하는 타입을 활용하거나 반환 타입 추론을 사용할 수 있다.

## 작업 완료 전 확인

```

bash
npm run type-check
npm test

```

- 개발 중에는 npm run type-check와 관련 테스트를 우선 확인한다.
- 배포 전 또는 PR 전 최종 확인이 필요할 때 npm run build를 실행한다.
- 검사 실패를 임의로 무시하지 않고 원인을 보고한다.
- 검사할 수 없는 항목이 있으면 그 이유를 함께 보고한다.
