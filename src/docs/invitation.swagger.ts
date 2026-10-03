// src/docs/invitation.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: Invitation
 *     description: 회원 초대
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     InvitationInfo:
 *       type: object
 *       description: 초대 조회 결과 (가입 페이지에서 이름, 이메일을 미리 채우는 용도)
 *       properties:
 *         id:
 *           type: string
 *           example: cm0abc123
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: 이직원
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         usedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 조회에 성공한 초대는 항상 null (사용된 초대는 409)
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         organizationId:
 *           type: integer
 *           example: 1
 *         organization:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: 스낵컴퍼니
 *     InvitationCreated:
 *       type: object
 *       description: 생성된 초대 (token은 응답에 포함되지 않고 메일로만 전달)
 *       properties:
 *         id:
 *           type: string
 *           example: cm0abc123
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: 이직원
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         usedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         organizationId:
 *           type: integer
 *           example: 1
 *         organization:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: 스낵컴퍼니
 */

/**
 * @openapi
 * /invitations/{token}:
 *   get:
 *     summary: 초대 정보 조회
 *     description: 초대 메일 링크의 token으로 초대 정보를 조회합니다. 로그인 없이 호출할 수 있습니다.
 *     tags: [Invitation]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 초대 메일 링크의 token 값
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
 *                       $ref: '#/components/schemas/InvitationInfo'
 *       400:
 *         description: 만료된 초대 (BAD_REQUEST)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 초대 정보를 찾을 수 없음 (NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 이미 사용된 초대 (CONFLICT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /super-admin/invitations:
 *   post:
 *     summary: 회원 초대 생성
 *     description: |
 *       SUPER_ADMIN만 호출할 수 있습니다.
 *       초대 메일을 발송하고 초대를 저장합니다. 초대는 7일간 유효하고 token은 메일로만 전달됩니다.
 *       같은 조직이 같은 이메일로 보낸 아직 유효한 이전 초대는 새 초대를 만들 때 함께 만료됩니다.
 *     tags: [Invitation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, role]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: 앞뒤 공백 제거, 소문자로 변환
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: 이직원
 *               role:
 *                 type: string
 *                 enum: [GENERAL, ADMIN]
 *                 description: SUPER_ADMIN은 초대할 수 없음
 *     responses:
 *       201:
 *         description: 초대 생성 및 메일 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/InvitationCreated'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 이미 가입한 이메일 (CONFLICT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
