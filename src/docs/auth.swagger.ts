// src/docs/auth.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: 인증 (가입, 로그인, 토큰 재발급, 비밀번호 재설정)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     SuperAdminSignupRequest:
 *       type: object
 *       description: 최고관리자 가입 (invitationToken 없음)
 *       required: [name, email, password, passwordConfirm, organizationName, bizRegNumber]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 김담당
 *           description: 앞뒤 공백 제거 후 1자 이상
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: admin@example.com
 *           description: 앞뒤 공백 제거, 소문자로 변환되어 저장
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           maxLength: 64
 *           example: password1234
 *           description: 앞뒤 공백 제거 후 8~64자
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: password1234
 *           description: password와 일치해야 함
 *         organizationName:
 *           type: string
 *           minLength: 1
 *           example: 스낵컴퍼니
 *         bizRegNumber:
 *           type: string
 *           example: 123-45-67890
 *           description: 하이픈은 허용되며 제거 후 숫자 10자리여야 함
 *     InvitationSignupRequest:
 *       type: object
 *       description: 초대 가입 (invitationToken 필수)
 *       required: [invitationToken, name, email, password, passwordConfirm]
 *       properties:
 *         invitationToken:
 *           type: string
 *           description: 초대 메일 링크의 token 값
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 이직원
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: user@example.com
 *           description: 초대받은 이메일과 일치해야 함
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           maxLength: 64
 *           example: password1234
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: password1234
 *     SignupResult:
 *       type: object
 *       properties:
 *         organization:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: 스낵컴퍼니
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: 김담당
 *             email:
 *               type: string
 *               format: email
 *               example: admin@example.com
 *             role:
 *               $ref: '#/components/schemas/Role'
 *     SigninUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 김담당
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         organizationId:
 *           type: integer
 *           example: 1
 */

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     description: >
 *       요청 바디에 invitationToken이 있으면 초대 가입, 없으면 최고관리자 가입으로 처리됩니다.
 *       최고관리자 가입에만 rate limit(IP당 1시간 10회)이 적용되고 초대 가입은 제한이 없습니다.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/SuperAdminSignupRequest'
 *               - $ref: '#/components/schemas/InvitationSignupRequest'
 *     responses:
 *       201:
 *         description: 가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SignupResult'
 *       400:
 *         description: >
 *           유효성 검사 실패 (VALIDATION_ERROR), 초대 가입에서 초대받은 이메일과
 *           가입 이메일 불일치 또는 만료된 초대 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 초대 정보를 찾을 수 없음 (NOT_FOUND, 초대 가입)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 이미 사용 중인 이메일 또는 이미 사용된 초대 (CONFLICT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: 최고관리자 가입 요청 횟수 초과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitResponse'
 */

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     summary: 로그인
 *     description: >
 *       성공 시 accessToken, refreshToken이 httpOnly 쿠키로 설정됩니다.
 *       IP당 15분에 5회까지 시도할 수 있습니다.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password1234
 *     responses:
 *       200:
 *         description: 로그인 성공 (쿠키 설정됨)
 *         headers:
 *           Set-Cookie:
 *             description: accessToken, refreshToken (httpOnly)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SigninUser'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: 이메일 또는 비밀번호 불일치 (UNAUTHORIZED), 비활성화된 계정 (ACCOUNT_INACTIVE)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: 로그인 시도 횟수 초과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitResponse'
 */

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: 토큰 재발급
 *     description: >
 *       refreshToken 쿠키를 검증하고 새 accessToken, refreshToken을 발급합니다.
 *       accessToken 없이 refreshToken 쿠키만으로 동작합니다.
 *       서비스 단계에서 거부된 경우(저장된 토큰 불일치, 비활성 계정 등)에는
 *       accessToken, refreshToken 쿠키가 삭제됩니다.
 *       토큰 없음, 위조, 만료처럼 인증 미들웨어에서 거부된 경우에는 쿠키가 삭제되지 않습니다.
 *     tags: [Auth]
 *     security:
 *       - refreshCookieAuth: []
 *     responses:
 *       200:
 *         description: 재발급 성공 (쿠키 갱신됨)
 *         headers:
 *           Set-Cookie:
 *             description: 새 accessToken, refreshToken (httpOnly)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: >
 *           refreshToken 없음, 위조, 불일치 (UNAUTHORIZED),
 *           refreshToken 만료 (SESSION_EXPIRED), 비활성화된 계정 (ACCOUNT_INACTIVE)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /auth/signout:
 *   post:
 *     summary: 로그아웃
 *     description: DB의 refreshToken을 제거하고 인증 쿠키를 삭제합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공 (쿠키 삭제됨)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @openapi
 * /auth/password-reset:
 *   post:
 *     summary: 비밀번호 재설정 요청
 *     description: >
 *       재설정 링크를 이메일로 발송합니다(30분간 유효).
 *       계정 존재 여부와 상관없이 항상 같은 응답을 반환합니다.
 *       IP당 1시간에 5회까지 요청할 수 있습니다.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: 요청 접수 (계정 존재 여부와 무관하게 동일)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 해당 이메일로 가입된 계정이 있다면 재설정 링크를 보내드렸습니다.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: 재설정 요청 횟수 초과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitResponse'
 *   patch:
 *     summary: 비밀번호 재설정 실행
 *     description: >
 *       메일로 받은 토큰으로 새 비밀번호를 설정합니다.
 *       성공 시 기존 로그인 세션(refreshToken)이 무효화되고 같은 토큰은 다시 쓸 수 없습니다.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resetPasswordToken, password, passwordConfirm]
 *             properties:
 *               resetPasswordToken:
 *                 type: string
 *                 description: 재설정 메일 링크의 token 값
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 64
 *                 example: newpassword1234
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: newpassword1234
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 비밀번호가 변경되었습니다.
 *       400:
 *         description: >
 *           유효성 검사 실패 (VALIDATION_ERROR),
 *           유효하지 않거나 만료된 토큰 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
