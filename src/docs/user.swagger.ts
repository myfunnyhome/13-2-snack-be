// src/docs/user.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: 내 정보와 회원 관리
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: 김담당
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         organization:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: 스낵컴퍼니
 *     UserListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         name:
 *           type: string
 *           example: 이직원
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         role:
 *           $ref: '#/components/schemas/Role'
 *     UserListResult:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserListItem'
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalCount:
 *           type: integer
 *           example: 25
 *         totalPages:
 *           type: integer
 *           example: 3
 */

/**
 * @openapi
 * /me:
 *   get:
 *     summary: 내 정보 조회
 *     description: 로그인한 사용자의 이름, 이메일, 권한, 회사명을 반환합니다.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: >
 *           인증 실패 (UNAUTHORIZED), accessToken 만료 (TOKEN_EXPIRED),
 *           권한 변경·탈퇴·비밀번호 변경/재설정으로 무효화된 토큰 (TOKEN_REVOKED, 쿠키 삭제)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @openapi
 * /me/profile:
 *   patch:
 *     summary: 내 정보 수정
 *     description: |
 *       비밀번호와 회사명을 수정합니다. 보낸 항목만 수정되고 둘 중 하나는 반드시 보내야 합니다.
 *       회사명은 SUPER_ADMIN만 수정할 수 있습니다.
 *       비밀번호를 변경하면 현재 사용 중인 토큰을 포함해 기존에 발급된 accessToken, refreshToken이 모두 무효화되어
 *       다음 요청부터 TOKEN_REVOKED(쿠키 삭제)가 반환되므로 새 비밀번호로 다시 로그인해야 합니다.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 minLength: 1
 *                 example: 새스낵컴퍼니
 *                 description: SUPER_ADMIN만 수정 가능
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
 *                 description: password를 보낼 때 일치해야 함
 *     responses:
 *       200:
 *         description: 수정 성공 (수정된 내 정보)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: 유효성 검사 실패 (VALIDATION_ERROR), 변경할 항목이 없음 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: >
 *           인증 실패 (UNAUTHORIZED), accessToken 만료 (TOKEN_EXPIRED),
 *           권한 변경·탈퇴·비밀번호 변경/재설정으로 무효화된 토큰 (TOKEN_REVOKED, 쿠키 삭제)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: SUPER_ADMIN이 아닌 사용자가 회사명을 수정함 (FORBIDDEN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @openapi
 * /super-admin/users:
 *   get:
 *     summary: 회원 목록 조회
 *     description: |
 *       SUPER_ADMIN만 호출할 수 있습니다.
 *       같은 조직의 활성 회원(GENERAL, ADMIN)을 최신 가입순으로 반환합니다. SUPER_ADMIN과 탈퇴 처리된 회원은 제외됩니다.
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 이름 검색어 (부분 일치, 대소문자 구분)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserListResult'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @openapi
 * /super-admin/users/{id}:
 *   patch:
 *     summary: 회원 권한 변경
 *     description: |
 *       SUPER_ADMIN만 호출할 수 있습니다. 같은 조직의 회원 권한을 GENERAL 또는 ADMIN으로 바꿉니다.
 *       대상 회원의 기존 accessToken, refreshToken은 즉시 무효화되어(TOKEN_REVOKED) 다시 로그인해야 합니다.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대상 회원 id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [GENERAL, ADMIN]
 *     responses:
 *       200:
 *         description: 변경 성공 (변경된 회원 정보)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserListItem'
 *       400:
 *         description: 유효성 검사 실패 (VALIDATION_ERROR), 자기 자신을 대상으로 지정함 또는 이미 탈퇴 처리된 회원 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: SUPER_ADMIN 권한이 아님, 또는 대상이 SUPER_ADMIN임 (FORBIDDEN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 회원을 찾을 수 없거나 다른 조직의 회원임 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: 회원 탈퇴 처리
 *     description: |
 *       SUPER_ADMIN만 호출할 수 있습니다.
 *       회원을 비활성화(소프트 삭제)하고 기존 accessToken, refreshToken을 즉시 무효화합니다(TOKEN_REVOKED).
 *       데이터는 삭제되지 않습니다.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대상 회원 id
 *     responses:
 *       200:
 *         description: 탈퇴 처리 성공 (처리된 회원 정보)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserListItem'
 *       400:
 *         description: 자기 자신을 대상으로 지정함 또는 이미 탈퇴 처리된 회원 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: SUPER_ADMIN 권한이 아님, 또는 대상이 SUPER_ADMIN임 (FORBIDDEN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 회원을 찾을 수 없거나 다른 조직의 회원임 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
