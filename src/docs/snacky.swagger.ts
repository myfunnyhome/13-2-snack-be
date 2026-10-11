// src/docs/snacky.swagger.ts

/**
 * @openapi
 * tags:
 *   - name: Snacky
 *     description: SNACK 사용 안내 AI 어시스턴트 (사용자 가이드 기반 답변)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     SnackyQuestionRequest:
 *       type: object
 *       required: [question]
 *       properties:
 *         question:
 *           type: string
 *           minLength: 1
 *           example: 구매 요청은 어떻게 하나요?
 *           description: 앞뒤 공백 제거 후 1자 이상
 *     SnackySource:
 *       type: object
 *       properties:
 *         documentId:
 *           type: string
 *           example: general
 *         section:
 *           type: string
 *           example: 구매 요청은 어떻게 하나요?
 *     SnackyAnswer:
 *       type: object
 *       properties:
 *         answer:
 *           type: string
 *           example: 장바구니에서 상품을 선택하고 [구매 요청]을 누르면 관리자에게 구매 요청이 전달됩니다.
 *         sources:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SnackySource'
 */

/**
 * @openapi
 * /snacky/answers:
 *   post:
 *     summary: Snacky 질문 답변
 *     description: |
 *       로그인한 사용자의 질문을 사용자 가이드에서 가장 관련 있는 섹션 1개로 검색하고, 그 섹션 내용만 근거로 Gemini가 짧은 답변을 만듭니다.
 *       sources는 검색된 섹션 정보로 서버가 붙입니다. 역할 제한은 없습니다.
 *     tags: [Snacky]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SnackyQuestionRequest'
 *     responses:
 *       200:
 *         description: 답변 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SnackyAnswer'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         description: 로그인 사용자별 10분당 10회 초과 (TOO_MANY_REQUESTS)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Gemini 호출 실패 또는 응답 형식 오류 (INTERNAL_SERVER_ERROR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: 질문 embedding 단계에서 Gemini 사용량 한도 초과 (SNACKY_BUSY)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
